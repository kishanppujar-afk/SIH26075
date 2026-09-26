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
    UploadedMaterial, GeneratedQuiz, GeneratedQuizQuestion,
    QuizAttempt, QuizAnswer
)
from app.schemas.material_quiz import (
    MaterialUploadResponse, QuizGenerationRequest, QuizResponse,
    QuizQuestionResponse, QuizAttemptStartResponse, QuizAttemptSubmitRequest,
    QuizAttemptResultResponse, QuestionEvaluationResult
)
from app.services.file_extraction_service import extract_text_from_file
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
    Uploads official training material (PDF, TXT, Markdown, etc.) and extracts text for AI analysis.
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
        status="processed" if char_count > 0 else "failed"
    )
    db.add(material)
    db.commit()

    return MaterialUploadResponse(
        id=material.id,
        filename=material.filename,
        mime_type=material.mime_type,
        status=material.status,
        extracted_char_count=char_count,
        associated_course_topic=material.associated_course_topic
    )


@router.get("/materials/{material_id}")
def get_material(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    return {
        "id": mat.id,
        "filename": mat.filename,
        "mime_type": mat.mime_type,
        "status": mat.status,
        "char_count": len(mat.extracted_text or ""),
        "associated_course_topic": mat.associated_course_topic,
        "created_at": mat.created_at.isoformat()
    }


@router.post("/materials/{material_id}/generate-quiz", response_model=QuizResponse)
async def generate_quiz_from_material(
    material_id: str,
    req: QuizGenerationRequest = QuizGenerationRequest(),
    db: Session = Depends(get_db)
):
    """
    Extracts diagnostic multiple-choice questions from uploaded material using local Ollama (gemma3:4b).
    Falls back gracefully to clearly-labeled template-based questions if LLM is offline.
    """
    mat = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")

    text = mat.extracted_text or mat.filename
    topic = mat.associated_course_topic or mat.filename

    ai_output = await mcq_generator.generate_mcqs(
        text=text,
        topic=topic,
        num_questions=req.num_questions
    )

    quiz_id = f"quiz-{uuid.uuid4().hex[:12]}"
    quiz_title = req.title or f"Diagnostic Checkpoint: {topic}"

    quiz = GeneratedQuiz(
        id=quiz_id,
        source_material_id=mat.id,
        title=quiz_title,
        generated_by=ai_output.get("generated_by", "template_fallback"),
        created_at=datetime.now(timezone.utc)
    )
    db.add(quiz)

    db_questions = []
    for i, q in enumerate(ai_output.get("questions", [])):
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
            explanation=q_row.explanation,
            source_snippet=q_row.source_snippet
        ))

    db.commit()

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        generated_by=quiz.generated_by,
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
        title=quiz.title,
        generated_by=quiz.generated_by,
        created_at=quiz.created_at.isoformat(),
        questions=[
            QuizQuestionResponse(
                id=q.id,
                question_text=q.question_text,
                options=q.options,
                explanation=q.explanation,
                source_snippet=q.source_snippet
            )
            for q in questions
        ]
    )


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
