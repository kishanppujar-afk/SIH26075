import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.material_quiz import (
    UploadedMaterial, MaterialChunk, GeneratedQuiz, GeneratedQuizQuestion,
    QuizAttempt, QuizAnswer
)
from app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentOption
)
from app.schemas.material_quiz import (
    ManualQuizCreate,
    ManualQuestionCreate,
    MaterialUploadResponse, MaterialItemResponse, MaterialChunkResponse,
    QuizGenerationRequest, QuizResponse, QuizQuestionResponse,
    PublishQuizRequest, QuizAttemptStartResponse, QuizAttemptSubmitRequest,
    QuizAttemptResultResponse, QuestionEvaluationResult
)
from app.services.file_extraction_service import extract_text_from_file
from app.services.rag_service import chunk_and_embed_material, select_spread_chunks
from app.ai.local_llm import OllamaMCQGenerator, OllamaFeedbackGenerator

router = APIRouter(tags=["AI Training Materials & Adaptive Quizzes"])
mcq_generator = OllamaMCQGenerator()
feedback_generator = OllamaFeedbackGenerator()


@router.post("/materials/upload", response_model=MaterialUploadResponse)
async def upload_training_material(
    file: UploadFile = File(...),
    associated_topic: Optional[str] = Form(None),
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Uploads official training material (PDF, TXT, etc.), extracts text,
    and runs the RAG pipeline: paragraph chunking + 768-d vector embedding via nomic-embed-text.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    mat_id = f"mat-{uuid.uuid4().hex[:12]}"
    filename = file.filename or "uploaded_material"
    file_path = os.path.join(settings.UPLOAD_DIR, f"{mat_id}_{filename}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    mime = file.content_type or "application/octet-stream"
    extracted_text, char_count = extract_text_from_file(file_path, mime)

    material = UploadedMaterial(
        id=mat_id,
        uploaded_by=current_emp.id,
        filename=filename,
        file_path=file_path,
        mime_type=mime,
        associated_course_topic=associated_topic,
        extracted_text=extracted_text,
        status="processing" if char_count > 0 else "failed"
    )
    db.add(material)
    db.commit()

    # Run RAG chunking and embedding
    chunks = []
    if char_count > 0:
        chunks = await chunk_and_embed_material(db, material.id)

    db.refresh(material)

    return MaterialUploadResponse(
        id=material.id,
        filename=material.filename,
        mime_type=material.mime_type,
        status=material.status,
        extracted_char_count=char_count,
        associated_course_topic=material.associated_course_topic,
        chunks_count=len(chunks)
    )


@router.get("/materials", response_model=List[MaterialItemResponse])
def list_materials(db: Session = Depends(get_db)):
    """
    Returns list of all uploaded training materials with chunk counts and generated quizzes count.
    """
    materials = db.query(UploadedMaterial).order_by(UploadedMaterial.created_at.desc()).all()
    results = []
    for m in materials:
        chunks_count = db.query(MaterialChunk).filter(MaterialChunk.material_id == m.id).count()
        quizzes_count = db.query(GeneratedQuiz).filter(GeneratedQuiz.source_material_id == m.id).count()
        results.append(MaterialItemResponse(
            id=m.id,
            filename=m.filename,
            mime_type=m.mime_type,
            status=m.status,
            char_count=len(m.extracted_text or ""),
            associated_course_topic=m.associated_course_topic,
            chunks_count=chunks_count,
            quizzes_count=quizzes_count,
            created_at=m.created_at.isoformat()
        ))
    return results


@router.get("/materials/{material_id}")
def get_material(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")

    chunks_count = db.query(MaterialChunk).filter(MaterialChunk.material_id == mat.id).count()
    quizzes = db.query(GeneratedQuiz).filter(GeneratedQuiz.source_material_id == mat.id).all()

    return {
        "id": mat.id,
        "filename": mat.filename,
        "mime_type": mat.mime_type,
        "status": mat.status,
        "char_count": len(mat.extracted_text or ""),
        "associated_course_topic": mat.associated_course_topic,
        "chunks_count": chunks_count,
        "created_at": mat.created_at.isoformat(),
        "quizzes": [
            {
                "id": q.id,
                "title": q.title,
                "generated_by": q.generated_by,
                "is_published": bool(q.is_published),
                "created_at": q.created_at.isoformat(),
                "question_count": len(q.questions)
            }
            for q in quizzes
        ]
    }


@router.get("/materials/{material_id}/chunks", response_model=List[MaterialChunkResponse])
def get_material_chunks(material_id: str, db: Session = Depends(get_db)):
    """
    Inspects all document chunks and vector embedding presence for an uploaded material.
    """
    chunks = db.query(MaterialChunk).filter(
        MaterialChunk.material_id == material_id
    ).order_by(MaterialChunk.chunk_index.asc()).all()

    return [
        MaterialChunkResponse(
            id=c.id,
            chunk_index=c.chunk_index,
            chunk_text=c.chunk_text,
            has_embedding=bool(c.embedding and len(c.embedding) > 0)
        )
        for c in chunks
    ]


@router.post("/materials/{material_id}/generate-quiz", response_model=QuizResponse)
async def generate_quiz_from_material(
    material_id: str,
    req: QuizGenerationRequest = QuizGenerationRequest(),
    db: Session = Depends(get_db)
):
    """
    RAG-based Question Generation:
    1. Retrieves document chunks, spreading selections across beginning, middle, and end.
    2. Sends ONLY that chunk's text to gemma3:4b to generate a tightly grounded diagnostic question.
    3. Saves each question with its actual source_snippet.
    """
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")

    # Ensure chunks exist; if not, chunk now
    chunks = db.query(MaterialChunk).filter(
        MaterialChunk.material_id == material_id
    ).order_by(MaterialChunk.chunk_index.asc()).all()

    if not chunks:
        chunks = await chunk_and_embed_material(db, material_id)

    if not chunks:
        raise HTTPException(status_code=400, detail="Cannot generate quiz: no text extracted from material")

    topic = mat.associated_course_topic or mat.filename
    quiz_id = f"quiz-{uuid.uuid4().hex[:12]}"
    quiz_title = req.title or f"Diagnostic Checkpoint: {topic}"

    # Sample chunks spread across the entire document
    selected_chunks = select_spread_chunks(chunks, req.num_questions)

    questions_data = []
    generated_by_mode = "local_llm"
    chunk_usage = {}

    angles = [
        "core principles, definitions, or foundational concepts",
        "methodology, procedural steps, formulas, or operational metrics",
        "quality control, validation checks, edge cases, or exception handling",
        "governance, compliance requirements, or institutional responsibilities"
    ]

    for chunk in selected_chunks:
        usage_count = chunk_usage.get(chunk.id, 0)
        chunk_usage[chunk.id] = usage_count + 1

        focus_angle = angles[usage_count % len(angles)] if usage_count > 0 else None
        avoid_questions = [
            q["question_text"] for q in questions_data
            if q.get("_source_chunk_id") == chunk.id
        ]

        gen_res = await mcq_generator.generate_single_mcq_from_chunk(
            chunk_text=chunk.chunk_text,
            topic=topic,
            focus_angle=focus_angle,
            avoid_questions=avoid_questions if avoid_questions else None
        )
        if gen_res.get("generated_by") == "template_fallback":
            generated_by_mode = "template_fallback"
        q_dict = gen_res["question"]
        q_dict["_source_chunk_id"] = chunk.id
        # Ensure source_snippet is populated with actual chunk text if missing
        if not q_dict.get("source_snippet"):
            q_dict["source_snippet"] = chunk.chunk_text[:300]
        questions_data.append(q_dict)

    # Clean up internal tracking key
    for q in questions_data:
        q.pop("_source_chunk_id", None)

    quiz = GeneratedQuiz(
        id=quiz_id,
        source_material_id=mat.id,
        title=quiz_title,
        generated_by=generated_by_mode,
        is_published=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(quiz)

    db_questions = []
    for q in questions_data:
        q_id = f"qq-{uuid.uuid4().hex[:10]}"
        q_row = GeneratedQuizQuestion(
            id=q_id,
            quiz_id=quiz.id,
            question_text=q["question_text"],
            options=q["options"],
            correct_option_index=q["correct_option_index"],
            explanation=q.get("explanation"),
            source_snippet=q.get("source_snippet")
        )
        db.add(q_row)
        db_questions.append(QuizQuestionResponse(
            id=q_id,
            question_text=q_row.question_text,
            options=q_row.options,
            correct_option_index=q_row.correct_option_index,
            explanation=q_row.explanation,
            source_snippet=q_row.source_snippet
        ))

    db.commit()

    return QuizResponse(
        id=quiz.id,
        source_material_id=mat.id,
        title=quiz.title,
        generated_by=quiz.generated_by,
        is_published=False,
        published_assessment_id=None,
        created_at=quiz.created_at.isoformat(),
        questions=db_questions
    )


@router.post("/quizzes/{quiz_id}/publish", response_model=QuizResponse)
def publish_quiz_toggle(
    quiz_id: str,
    req: PublishQuizRequest = PublishQuizRequest(),
    db: Session = Depends(get_db)
):
    """
    Publishes or unpublishes a generated quiz.
    When published, creates an Assessment entry in the assessment hub so employees
    can discover and practice it with zero employee-app code changes.
    Practice assessments NEVER mutate official employee readiness_score or skill_index.
    """
    quiz = db.query(GeneratedQuiz).filter(GeneratedQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(GeneratedQuizQuestion).filter(GeneratedQuizQuestion.quiz_id == quiz.id).all()
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == quiz.source_material_id).first() if quiz.source_material_id else None

    asm_id = f"asm-quiz-{quiz.id}"

    if req.is_published:
        # Check if already exists in Assessment
        existing_asm = db.query(Assessment).filter(Assessment.id == asm_id).first()
        topic_name = (mat.associated_course_topic if mat else None) or "Official Practice"

        if not existing_asm:
            new_asm = Assessment(
                id=asm_id,
                title=quiz.title,
                category="Practice / Official Reference",
                description=f"AI-generated diagnostic practice quiz based on official document '{mat.filename if mat else 'Training Material'}'. For self-paced reference and review.",
                target_role="General Statistical Cadre",
                estimated_minutes=max(5, len(questions) * 2),
                question_count=len(questions),
                due_date="Self-Paced",
                status="Ready for Baseline Discovery",
                is_practice=True
            )
            db.add(new_asm)

            # Create assessment questions and options
            for q_idx, q in enumerate(questions, 1):
                asm_q_id = f"q-{q.id}"
                asm_q = AssessmentQuestion(
                    id=asm_q_id,
                    assessment_id=asm_id,
                    topic=topic_name,
                    competency=topic_name,
                    scenario=f"Reference Context: {q.source_snippet[:220] if q.source_snippet else 'Document Review'}",
                    question_text=q.question_text,
                    difficulty="intermediate",
                    question_type="mcq",
                    correct_option_id=f"opt-{q.id}-{q.correct_option_index}",
                    rationale=q.explanation or "Refer to the source document snippet.",
                    growth_resource={"title": mat.filename if mat else "Training Material", "type": "Document Lab", "duration": "30 mins"}
                )
                db.add(asm_q)

                # Add 4 standard options
                for opt_idx, opt_text in enumerate(q.options):
                    db.add(AssessmentOption(
                        id=f"opt-{q.id}-{opt_idx}",
                        question_id=asm_q_id,
                        text=opt_text,
                        is_correct=(opt_idx == q.correct_option_index),
                        is_uncertainty_option=False
                    ))
                # Add uncertainty option for diagnostic baseline flow
                db.add(AssessmentOption(
                    id=f"opt-{q.id}-unsure",
                    question_id=asm_q_id,
                    text="I'm not sure yet — need to review this document section",
                    is_correct=False,
                    is_uncertainty_option=True
                ))
        else:
            existing_asm.status = "Ready for Baseline Discovery"
            existing_asm.is_practice = True

        quiz.is_published = True
        quiz.published_assessment_id = asm_id
    else:
        # Unpublish: remove or archive assessment
        if quiz.published_assessment_id:
            db.query(Assessment).filter(Assessment.id == quiz.published_assessment_id).delete()
        quiz.is_published = False
        quiz.published_assessment_id = None

    db.commit()
    db.refresh(quiz)

    db_questions = [
        QuizQuestionResponse(
            id=q.id,
            question_text=q.question_text,
            options=q.options,
            correct_option_index=q.correct_option_index,
            explanation=q.explanation,
            source_snippet=q.source_snippet
        )
        for q in questions
    ]

    return QuizResponse(
        id=quiz.id,
        source_material_id=quiz.source_material_id,
        title=quiz.title,
        generated_by=quiz.generated_by,
        is_published=bool(quiz.is_published),
        published_assessment_id=quiz.published_assessment_id,
        created_at=quiz.created_at.isoformat(),
        questions=db_questions
    )


@router.get("/quizzes/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    quiz = db.query(GeneratedQuiz).filter(GeneratedQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(GeneratedQuizQuestion).filter(GeneratedQuizQuestion.quiz_id == quiz.id).all()
    return QuizResponse(
        id=quiz.id,
        source_material_id=quiz.source_material_id,
        title=quiz.title,
        generated_by=quiz.generated_by,
        is_published=bool(quiz.is_published),
        published_assessment_id=quiz.published_assessment_id,
        created_at=quiz.created_at.isoformat(),
        questions=[
            QuizQuestionResponse(
                id=q.id,
                question_text=q.question_text,
                options=q.options,
                correct_option_index=q.correct_option_index,
                explanation=q.explanation,
                source_snippet=q.source_snippet
            )
            for q in questions
        ]
    )


@router.delete("/materials/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Also clean up published assessment if any
    quizzes = db.query(GeneratedQuiz).filter(GeneratedQuiz.source_material_id == mat.id).all()
    for q in quizzes:
        if q.published_assessment_id:
            db.query(Assessment).filter(Assessment.id == q.published_assessment_id).delete()

    db.delete(mat)
    db.commit()
    return {"status": "deleted", "id": material_id}


@router.post("/quizzes/{quiz_id}/attempts", response_model=QuizAttemptStartResponse)
def start_quiz_attempt(
    quiz_id: str,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    quiz = db.query(GeneratedQuiz).filter(GeneratedQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    att_id = f"qa-{uuid.uuid4().hex[:12]}"
    attempt = QuizAttempt(
        id=att_id,
        quiz_id=quiz.id,
        employee_id=current_emp.id,
        started_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    db.commit()

    return QuizAttemptStartResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        started_at=attempt.started_at.isoformat()
    )


@router.post("/quiz-attempts/{attempt_id}/submit", response_model=QuizAttemptResultResponse)
async def submit_quiz_attempt(
    attempt_id: str,
    submission: QuizAttemptSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submits quiz answers, calculates percentage score, attaches explanations,
    and invokes AI feedback generator for personalized coaching summary.
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")

    quiz = db.query(GeneratedQuiz).filter(GeneratedQuiz.id == attempt.quiz_id).first()
    questions = db.query(GeneratedQuizQuestion).filter(GeneratedQuizQuestion.quiz_id == attempt.quiz_id).all()

    correct_count = 0
    question_results = []

    for q in questions:
        selected_index = submission.answers.get(q.id, -1)
        is_correct = (selected_index == q.correct_option_index)
        if is_correct:
            correct_count += 1

        ans_row = QuizAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_option_index=selected_index,
            is_correct=is_correct
        )
        db.add(ans_row)

        question_results.append(QuestionEvaluationResult(
            question_id=q.id,
            question_text=q.question_text,
            selected_option_index=selected_index,
            correct_option_index=q.correct_option_index,
            is_correct=is_correct,
            explanation=q.explanation
        ))

    score = round((correct_count / max(1, len(questions))) * 100.0, 1)
    attempt.completed_at = datetime.now(timezone.utc)
    attempt.score = score

    # Generate coaching feedback
    feedback_output = await feedback_generator.generate_feedback(
        quiz_title=quiz.title if quiz else "Diagnostic Quiz",
        score=score,
        question_evaluations=[q.model_dump() for q in question_results]
    )

    attempt.feedback_text = feedback_output.get("feedback_text")

    if score >= 75:
        from app.models.competency import EmployeeSkillScore
        from app.models.employee import Employee
        from datetime import datetime, timezone
        skill_score = db.query(EmployeeSkillScore).filter(EmployeeSkillScore.employee_id == attempt.employee_id).first()
        if not skill_score:
            skill_score = EmployeeSkillScore(
                employee_id=attempt.employee_id,
                skill_id="s4",
                current_score=50.0,
                target_score=85.0,
                status="Growth Opportunity",
                trending="neutral",
                last_assessed_at=datetime.now(timezone.utc)
            )
            db.add(skill_score)
        
        skill_score.current_score = min(100.0, skill_score.current_score + 5.0)
        if skill_score.current_score >= skill_score.target_score:
            skill_score.status = "Competency Achieved"
        emp = db.query(Employee).filter(Employee.id == attempt.employee_id).first()
        if emp:
            emp.completed_courses_count = (emp.completed_courses_count or 0) + 1
    db.commit()

    return QuizAttemptResultResponse(
        attempt_id=attempt.id,
        quiz_id=attempt.quiz_id,
        score=score,
        total_questions=len(questions),
        correct_count=correct_count,
        feedback_text=attempt.feedback_text or "Quiz completed successfully.",
        feedback_generated_by=feedback_output.get("generated_by", "template_fallback"),
        question_results=question_results
    )




@router.post("/manual-quiz")
def create_manual_quiz(quiz_create: ManualQuizCreate, db: Session = Depends(get_db)):
    quiz_id = f"QZ-{uuid.uuid4().hex[:8]}"
    
    deadline_dt = None
    if quiz_create.deadline:
        try:
            deadline_dt = datetime.fromisoformat(quiz_create.deadline.replace('Z', '+00:00'))
        except:
            pass
            
    quiz = GeneratedQuiz(
        id=quiz_id,
        source_material_id=None,
        title=quiz_create.title,
        generated_by="manual",
        is_published=True,
        deadline=deadline_dt
    )
    db.add(quiz)
    
    for q in quiz_create.questions:
        q_obj = GeneratedQuizQuestion(
            id=f"QQ-{uuid.uuid4().hex[:8]}",
            quiz_id=quiz_id,
            question_text=q.question_text,
            options=q.options,
            correct_option_index=q.correct_option_index,
            explanation="Manual quiz",
            source_snippet="Manual quiz"
        )
        db.add(q_obj)
        
    db.commit()
    db.refresh(quiz)
    return {"status": "success", "quiz_id": quiz.id}
