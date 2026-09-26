from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.ai_insight import AiInsight
from app.ai.local_llm import OllamaCompetencyAnalyzer

router = APIRouter(prefix="/ai", tags=["AI Telemetry & Insights"])
analyzer = OllamaCompetencyAnalyzer()


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
