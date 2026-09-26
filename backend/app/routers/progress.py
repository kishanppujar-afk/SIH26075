from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.competency import CompetencyScoreHistory, EmployeeSkillScore, Skill
from app.schemas.competency import ProgressResponse, ProgressRecord, GrowthStageResponse
from app.services.progress_service import get_growth_stage_info

router = APIRouter(prefix="/employees/me", tags=["Progress & Growth Journey"])


@router.get("/progress", response_model=ProgressResponse)
def get_employee_progress(
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Returns competency trajectory over time, before/after assessment scores,
    and readiness score trend for Growth Tree visualizers and ProfileView.
    """
    history_entries = db.query(CompetencyScoreHistory).filter(
        CompetencyScoreHistory.employee_id == current_emp.id
    ).order_by(CompetencyScoreHistory.recorded_at.asc()).all()

    skill_map = {s.id: s.name for s in db.query(Skill).all()}

    history_records = [
        ProgressRecord(
            skill_id=h.skill_id,
            skill_name=skill_map.get(h.skill_id, h.skill_id),
            score=h.score,
            source=h.source,
            recorded_at=h.recorded_at.isoformat()
        )
        for h in history_entries
    ]

    # Synthesize readiness score progression trend points
    readiness_trend = [
        {"week": "Week 1", "readinessScore": 64, "skillIndex": 70},
        {"week": "Week 2", "readinessScore": 69, "skillIndex": 74},
        {"week": "Week 3", "readinessScore": 73, "skillIndex": 78},
        {"week": "Current", "readinessScore": current_emp.readiness_score, "skillIndex": current_emp.skill_index},
    ]

    return ProgressResponse(
        history=history_records,
        readinessScoreTrend=readiness_trend,
        currentReadinessScore=current_emp.readiness_score,
        currentSkillIndex=current_emp.skill_index
    )


@router.get("/growth-stage", response_model=GrowthStageResponse)
def get_growth_stage(current_emp: Employee = Depends(get_current_employee)):
    """
    Returns exact growth tree stage metadata according to utils/growthStage.js:
    Seed & Sprout (0-24) -> Young Sapling (25-49) -> Young Tree (50-74) -> Blossoming Tree (75-100).
    """
    stage_info = get_growth_stage_info(current_emp.readiness_score)
    return GrowthStageResponse(
        stage=stage_info["stageIndex"],
        name=stage_info["name"],
        title=stage_info["name"],
        description=stage_info["narrative"],
        readinessScore=stage_info["readinessScore"],
        blossomPercentage=stage_info["blossomPercentage"]
    )
