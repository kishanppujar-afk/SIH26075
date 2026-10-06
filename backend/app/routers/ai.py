from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.ai_insight import AiInsight
from app.models.competency import EmployeeSkillScore, Skill
from app.models.learning_resource import Recommendation
from app.models.assessment import AssessmentAttempt, Assessment
from app.ai.local_llm import OllamaCompetencyAnalyzer, OllamaDishaChat

router = APIRouter(prefix="/ai", tags=["AI Telemetry & Insights"])
analyzer = OllamaCompetencyAnalyzer()
disha_chat = OllamaDishaChat()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's query")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation turns")


class ChatResponse(BaseModel):
    response: str
    generated_by: str



@router.get("/insights")
def get_ai_insights(
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Returns AI insights matching the exact shape consumed by Dashboard.jsx (mockAiInsights):
    Opportunity insights, streaks, and competency alerts.
    """
    insights = db.query(AiInsight).filter(AiInsight.employee_id == current_emp.id).all()
    if not insights:
        # Fallback to default insights
        return [
            {
                "id": "ins1",
                "type": "Opportunity",
                "text": f"You are only {max(5, 100 - current_emp.readiness_score)} points away from matching the benchmark for {current_emp.target_role}. Prioritizing your top growth skill will bridge 60% of this gap."
            },
            {
                "id": "ins2",
                "type": "Streak",
                "text": "Consistent learner! You have logged 4 consecutive weeks of continuous skill development."
            }
        ]

    return [
        {"id": i.id, "type": i.type, "text": i.text}
        for i in insights
    ]


@router.post("/gap-analysis")
async def analyze_skill_gap_with_ai(
    skill_name: str = Query(..., description="Target skill name"),
    current_score: int = Query(60, ge=0, le=100),
    target_score: int = Query(85, ge=0, le=100),
    target_role: Optional[str] = Query(None),
    current_emp: Employee = Depends(get_current_employee)
):
    """
    Invokes local Ollama (gemma3:4b) to analyze skill gap against the target role benchmark.
    Falls back gracefully to deterministic rule-based justification if Ollama is busy.
    """
    role = target_role or current_emp.target_role
    return await analyzer.analyze_gap(
        skill_name=skill_name,
        current_score=current_score,
        target_score=target_score,
        target_role=role,
        department=current_emp.department
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_disha(
    req: ChatRequest,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Directional AI assistant ('Disha') for officials in India's National Statistical System.
    Analyzes the employee's current skill gaps, recommended courses, and assessments,
    and returns concise, guiding next steps via gemma3:4b (with deterministic fallback).
    """
    # 1. Fetch employee skill scores + targets
    scores = (
        db.query(EmployeeSkillScore)
        .join(Skill, EmployeeSkillScore.skill_id == Skill.id)
        .filter(EmployeeSkillScore.employee_id == current_emp.id)
        .all()
    )
    gaps = []
    for s in scores:
        target = s.target_score or 85
        delta = target - s.current_score
        gaps.append({
            "skill_name": s.skill.name if s.skill else s.skill_id,
            "current_score": s.current_score,
            "target_score": target,
            "gap": max(0, delta),
            "status": s.status or "On Track"
        })
    gaps.sort(key=lambda x: x["gap"], reverse=True)
    top_gaps = gaps[:5]

    # 2. Fetch employee recommendations
    recs = db.query(Recommendation).filter(Recommendation.employee_id == current_emp.id).limit(4).all()
    recommendations_data = [
        {
            "title": r.title,
            "type": r.type,
            "provider": r.provider,
            "impact_skill": r.impact_skill,
            "match_score": r.match_score
        }
        for r in recs
    ]

    # 3. Fetch recent completed assessment attempts
    attempts = (
        db.query(AssessmentAttempt)
        .filter(
            AssessmentAttempt.employee_id == current_emp.id,
            AssessmentAttempt.status == "completed"
        )
        .order_by(AssessmentAttempt.completed_at.desc())
        .limit(3)
        .all()
    )
    assessments_data = [
        {
            "assessment_title": a.assessment.title if a.assessment else a.assessment_id,
            "score": a.score or 0.0,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None
        }
        for a in attempts
    ]

    context = {
        "name": current_emp.name,
        "designation": current_emp.designation or "Junior Statistical Officer",
        "department": current_emp.department,
        "target_role": current_emp.target_role,
        "readiness_score": current_emp.readiness_score,
        "skill_index": current_emp.skill_index or 70,
        "top_gaps": top_gaps,
        "recommendations": recommendations_data,
        "recent_assessments": assessments_data
    }

    history = [
        {"role": turn.role, "content": turn.content}
        for turn in (req.conversation_history or [])
    ]

    return await disha_chat.generate_chat_response(
        employee_context=context,
        conversation_history=history,
        user_message=req.message
    )

