from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.competency import Skill, EmployeeSkillScore
from app.models.learning_resource import LearningResource, Recommendation
from app.models.assessment import Assessment
from app.schemas.competency import DevelopmentPathResponse, SkillResponse
from app.schemas.course import RecommendationResponse
from app.services.gap_analysis_service import compute_skill_gap, match_resources_heuristic, match_resources_for_skill
from app.integrations.nssta_data import OFFICIAL_CATALOG

router = APIRouter(tags=["Development Path & Recommendations"])


@router.get("/skills/{skill_id}/development-path", response_model=DevelopmentPathResponse)
async def get_development_path_for_skill(
    skill_id: str,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Server-side implementation of the DevelopmentPath.jsx component:
    Computes skill gap, retrieves matched verified official NSSTA / MoSPI resources,
    and links the corresponding diagnostic assessment.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        # Fallback to first available skill or 404
        skill = db.query(Skill).first()
        if not skill:
            raise HTTPException(status_code=404, detail="Skill not found")

    emp_score = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == current_emp.id,
        EmployeeSkillScore.skill_id == skill.id
    ).first()

    current_score = emp_score.current_score if emp_score else 50
    target_score = emp_score.target_score if emp_score else 85
    status = emp_score.status if emp_score else "Growth Opportunity"
    trending = emp_score.trending if emp_score else "neutral"

    gap_info = compute_skill_gap(current_score, target_score)

    # Match resources from catalog
    matched_resources = await match_resources_for_skill(
        skill_name=skill.name,
        category=skill.category,
        catalog=OFFICIAL_CATALOG,
        top_k=3
    )

    # Find linked assessment
    linked_assessment = db.query(Assessment).filter(
        (Assessment.category == skill.category) | (Assessment.title.contains(skill.name[:10]))
    ).first()

    linked_assessment_dict = None
    if linked_assessment:
        linked_assessment_dict = {
            "id": linked_assessment.id,
            "title": linked_assessment.title,
            "category": linked_assessment.category,
            "estimatedMinutes": linked_assessment.estimated_minutes,
            "status": linked_assessment.status,
            "questionCount": linked_assessment.question_count,
            "description": linked_assessment.description
        }

    return DevelopmentPathResponse(
        skill=SkillResponse(
            id=skill.id,
            name=skill.name,
            category=skill.category,
            currentScore=current_score,
            targetScore=target_score,
            status=status,
            trending=trending,
            description=skill.description
        ),
        gap=gap_info["gap"],
        isOpportunity=gap_info["isOpportunity"],
        isExceeds=gap_info["isExceeds"],
        recommendedResources=matched_resources,
        linkedAssessment=linked_assessment_dict
    )


@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Returns AI-curated recommendations in the exact shape consumed by CoursesView.jsx and Dashboard.jsx.
    """
    recs = db.query(Recommendation).filter(
        Recommendation.employee_id == current_emp.id
    ).all()

    if not recs:
        # Fallback to all recommendations in table
        recs = db.query(Recommendation).all()

    response = []
    for r in recs:
        response.append(RecommendationResponse(
            id=r.id,
            title=r.title,
            type=r.type,
            provider=r.provider,
            duration=r.duration,
            impactSkill=r.impact_skill,
            matchScore=r.match_score,
            isUrgent=r.is_urgent,
            reason=r.reason,
            url=r.learning_resource.url if r.learning_resource else None
        ))

    return response
