from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.competency import Skill, CompetencyDomain, EmployeeSkillScore
from app.schemas.competency import SkillResponse, CompetencyDomainResponse

router = APIRouter(tags=["Skills & Competencies"])


@router.get("/skills", response_model=List[SkillResponse])
def get_skills(
    category: Optional[str] = Query(None, description="Filter by category (e.g. 'Technical', 'Cloud & DevOps')"),
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Returns skills and current employee proficiency scores matching the exact schema
    consumed by SkillsView.jsx and Dashboard.jsx.
    """
    query = db.query(Skill)
    if category and category.lower() != "all":
        query = query.filter(Skill.category == category)
    
    skills = query.all()

    # Get employee score map
    emp_scores = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == current_emp.id
    ).all()
    score_map = {s.skill_id: s for s in emp_scores}

    response = []
    for skill in skills:
        emp_score = score_map.get(skill.id)
        current_score = emp_score.current_score if emp_score else 50
        target_score = emp_score.target_score if emp_score else 85
        status = emp_score.status if emp_score else "Growth Opportunity"
        trending = emp_score.trending if emp_score else "neutral"

        response.append(SkillResponse(
            id=skill.id,
            name=skill.name,
            category=skill.category,
            currentScore=current_score,
            targetScore=target_score,
            status=status,
            trending=trending,
            description=skill.description
        ))

    # Prioritize skills with active employee scores, sorted by gap delta descending
    response.sort(
        key=lambda item: (
            0 if item.id in score_map else 1,
            -(item.targetScore - item.currentScore)
        )
    )

    return response


@router.get("/skills/{skill_id}", response_model=SkillResponse)
def get_skill_by_id(
    skill_id: str,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found.")

    emp_score = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == current_emp.id,
        EmployeeSkillScore.skill_id == skill.id
    ).first()

    current_score = emp_score.current_score if emp_score else 50
    target_score = emp_score.target_score if emp_score else 85
    status = emp_score.status if emp_score else "Growth Opportunity"
    trending = emp_score.trending if emp_score else "neutral"

    return SkillResponse(
        id=skill.id,
        name=skill.name,
        category=skill.category,
        currentScore=current_score,
        targetScore=target_score,
        status=status,
        trending=trending,
        description=skill.description
    )


@router.get("/competency-domains", response_model=List[CompetencyDomainResponse])
def get_competency_domains(db: Session = Depends(get_db)):
    """Returns the four core National Statistical System competency domains."""
    domains = db.query(CompetencyDomain).all()
    return domains
