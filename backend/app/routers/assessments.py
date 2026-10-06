import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.competency import Skill
from app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentOption,
    AssessmentAttempt, AssessmentAnswer, AssessmentResult
)
from app.schemas.assessment import (
    AssessmentResponse, AssessmentQuestionResponse, AssessmentOptionResponse,
    AttemptStartResponse, AnswerSubmitRequest, AssessmentSubmissionResult
)
from app.services.scoring_service import evaluate_assessment_submission
from app.services.progress_service import record_competency_score

router = APIRouter(tags=["Assessments & Competency Baseline Discovery"])


@router.get("/assessments", response_model=List[AssessmentResponse])
def get_assessments(db: Session = Depends(get_db)):
    """
    Returns available assessments matching the exact shape consumed by AssessmentsView.jsx and AssessmentHub.jsx.
    """
    assessments = db.query(Assessment).all()
    return [
        AssessmentResponse(
            id=a.id,
            title=a.title,
            category=a.category,
            dueDate=a.due_date,
            completedDate=a.completed_date,
            estimatedMinutes=a.estimated_minutes,
            status=a.status,
            questionCount=a.question_count,
            targetRole=a.target_role,
            description=a.description or "",
            baselineLevel=a.baseline_level,
            isPractice=bool(a.is_practice)
        )
        for a in assessments
    ]


@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return AssessmentResponse(
        id=a.id,
        title=a.title,
        category=a.category,
        dueDate=a.due_date,
        completedDate=a.completed_date,
        estimatedMinutes=a.estimated_minutes,
        status=a.status,
        questionCount=a.question_count,
        targetRole=a.target_role,
        description=a.description or "",
        baselineLevel=a.baseline_level,
        isPractice=bool(a.is_practice)
    )


@router.get("/assessments/{assessment_id}/questions", response_model=List[AssessmentQuestionResponse])
def get_assessment_questions(assessment_id: str, db: Session = Depends(get_db)):
    """
    Returns questions in the exact shape consumed by AssessmentQuestionCard.jsx.
    """
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == assessment_id).all()
    if not questions:
        # Fallback to all questions if specific ID not found
        questions = db.query(AssessmentQuestion).all()

    response = []
    for q in questions:
        options = [
            AssessmentOptionResponse(id=opt.id, text=opt.text)
            for opt in q.options if not opt.is_uncertainty_option
        ]
        unsure_opt = next((opt for opt in q.options if opt.is_uncertainty_option), None)
        unsure_resp = (
            AssessmentOptionResponse(id=unsure_opt.id, text=unsure_opt.text)
            if unsure_opt else None
        )

        response.append(AssessmentQuestionResponse(
            id=q.id,
            topic=q.topic,
            competency=q.competency,
            scenario=q.scenario,
            question=q.question_text,
            options=options,
            uncertaintyOption=unsure_resp,
            correctOptionId=q.correct_option_id,
            rationale=q.rationale,
            growthResource=q.growth_resource
        ))

    return response


@router.post("/assessments/{assessment_id}/attempts", response_model=AttemptStartResponse)
def start_assessment_attempt(
    assessment_id: str,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Initializes a new diagnostic baseline discovery attempt."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    attempt_id = f"att-{uuid.uuid4().hex[:12]}"
    attempt = AssessmentAttempt(
        id=attempt_id,
        employee_id=current_emp.id,
        assessment_id=assessment_id,
        status="in_progress",
        started_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    db.commit()

    return AttemptStartResponse(
        attempt_id=attempt.id,
        assessment_id=attempt.assessment_id,
        status=attempt.status,
        started_at=attempt.started_at.isoformat()
    )


@router.patch("/attempts/{attempt_id}/answers")
def autosave_answer(
    attempt_id: str,
    answer: AnswerSubmitRequest,
    db: Session = Depends(get_db)
):
    """Quiet auto-save answering endpoint during baseline discovery."""
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == answer.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    selected_opt = db.query(AssessmentOption).filter(AssessmentOption.id == answer.selected_option_id).first()
    is_correct = bool(answer.selected_option_id == q.correct_option_id)
    is_uncertain = bool(selected_opt and selected_opt.is_uncertainty_option)

    existing_ans = db.query(AssessmentAnswer).filter(
        AssessmentAnswer.attempt_id == attempt_id,
        AssessmentAnswer.question_id == answer.question_id
    ).first()

    if existing_ans:
        existing_ans.selected_option_id = answer.selected_option_id
        existing_ans.is_correct = is_correct
        existing_ans.is_uncertain = is_uncertain
    else:
        new_ans = AssessmentAnswer(
            attempt_id=attempt_id,
            question_id=answer.question_id,
            selected_option_id=answer.selected_option_id,
            is_correct=is_correct,
            is_uncertain=is_uncertain
        )
        db.add(new_ans)

    db.commit()
    return {"status": "saved", "question_id": answer.question_id}


@router.post("/attempts/{attempt_id}/submit", response_model=AssessmentSubmissionResult)
def submit_and_evaluate_attempt(
    attempt_id: str,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Finalizes assessment attempt, evaluates answers with zero-penalty diagnostic rubric,
    records competency trajectory, updates employee skill benchmarks, and returns
    capabilityList / confidentCorrect / growthOpportunities for AssessmentResults.jsx.
    """
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    assessment = db.query(Assessment).filter(Assessment.id == attempt.assessment_id).first()
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == attempt.assessment_id).all()
    if not questions:
        questions = db.query(AssessmentQuestion).all()

    answers = db.query(AssessmentAnswer).filter(AssessmentAnswer.attempt_id == attempt_id).all()
    answers_map = {a.question_id: a.selected_option_id for a in answers}

    eval_result = evaluate_assessment_submission(questions, answers_map)

    attempt.status = "completed"
    attempt.completed_at = datetime.now(timezone.utc)
    attempt.score = eval_result["overallScore"]

    is_practice = (
        getattr(assessment, "is_practice", False)
        or (assessment and "Practice" in (assessment.category or ""))
        or (assessment and "Reference" in (assessment.category or ""))
        or (assessment and assessment.id.startswith("asm-quiz-"))
    )

    if assessment and not is_practice:
        assessment.status = "Baseline Established"
        assessment.baseline_level = eval_result["baselineLevel"]
        assessment.completed_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Write AssessmentResult rows and update employee competency scores
    for item in eval_result["capabilityList"]:
        res_row = AssessmentResult(
            attempt_id=attempt.id,
            skill_name=item["name"],
            score=item["score"],
            target=item["target"],
            status=item["status"]
        )
        db.add(res_row)

        # Match to a Skill entity if exists
        matched_skill = db.query(Skill).filter(
            (Skill.name.ilike(f"%{item['name']}%")) | (Skill.name == item["name"])
        ).first()

        # Generated/practice quizzes must NEVER mutate official EmployeeSkillScore, readiness_score, or skill_index
        if matched_skill and not is_practice:
            record_competency_score(
                db=db,
                employee_id=current_emp.id,
                skill_id=matched_skill.id,
                new_score=item["score"],
                source="assessment",
                attempt_id=attempt.id
            )

    db.commit()

    return AssessmentSubmissionResult(
        attempt_id=attempt.id,
        overallScore=eval_result["overallScore"],
        baselineLevel=eval_result["baselineLevel"],
        capabilityList=eval_result["capabilityList"],
        confidentCorrect=eval_result["confidentCorrect"],
        growthOpportunities=eval_result["growthOpportunities"]
    )


@router.get("/attempts/{attempt_id}/results")
def get_attempt_results(attempt_id: str, db: Session = Depends(get_db)):
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    results = db.query(AssessmentResult).filter(AssessmentResult.attempt_id == attempt_id).all()
    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "status": attempt.status,
        "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
        "results": [
            {"skill_name": r.skill_name, "score": r.score, "target": r.target, "status": r.status}
            for r in results
        ]
    }
