"""SkillStat AI - Manager Router

Team telemetry and competency drilldowns for MoSPI Managers.
Requires role='manager' and enforces strict manager scoping / isolation.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_manager
from app.models.employee import Employee
from app.schemas.admin import ManagerTeamResponse, ManagerTeamCompetencyResponse
from app.services import analytics_service

router = APIRouter(prefix="/manager", tags=["Manager Telemetry (Team Competency)"])


@router.get("/my-team", response_model=ManagerTeamResponse)
def get_my_team(
    db: Session = Depends(get_db),
    manager: Employee = Depends(get_current_manager)
):
    """
    Returns the authenticated manager's direct reports, individual readiness scores,
    and 4-domain gap metrics.
    """
    team_data = analytics_service.calculate_manager_team_aggregates(db, manager.id)
    if not team_data:
        raise HTTPException(status_code=404, detail="Manager profile not found")

    return ManagerTeamResponse(
        manager_id=team_data["manager_id"],
        manager_name=team_data["manager_name"],
        department=team_data["department"],
        department_id=team_data["department_id"],
        direct_reports_count=team_data["team_size"],
        direct_reports=team_data["direct_reports"]
    )


@router.get("/team-competency", response_model=ManagerTeamCompetencyResponse)
def get_my_team_competency(
    db: Session = Depends(get_db),
    manager: Employee = Depends(get_current_manager)
):
    """
    Returns team-wide competency aggregates across the 4 canonical domains
    (Statistical, Technical, Digital Governance, Behavioural) scoped to the manager's direct reports.
    """
    team_data = analytics_service.calculate_manager_team_aggregates(db, manager.id)
    if not team_data:
        raise HTTPException(status_code=404, detail="Manager profile not found")

    return ManagerTeamCompetencyResponse(
        manager_id=team_data["manager_id"],
        manager_name=team_data["manager_name"],
        department=team_data["department"],
        department_id=team_data["department_id"],
        team_size=team_data["team_size"],
        readiness_avg=team_data["readiness_avg"],
        domain_averages=team_data["domain_averages"],
        domain_gaps=team_data["domain_gaps"],
        direct_reports=team_data["direct_reports"]
    )


@router.get("/teams/{target_manager_id}", response_model=ManagerTeamResponse)
def get_manager_team_by_id(
    target_manager_id: str,
    db: Session = Depends(get_db),
    manager: Employee = Depends(get_current_manager)
):
    """
    Accesses a manager's team data by manager_id.
    Strictly enforces manager data isolation: returns 403 Forbidden if a manager
    attempts to query another manager's team telemetry.
    """
    if target_manager_id != manager.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot access another manager's team data"
        )

    team_data = analytics_service.calculate_manager_team_aggregates(db, manager.id)
    if not team_data:
        raise HTTPException(status_code=404, detail="Manager profile not found")

    return ManagerTeamResponse(
        manager_id=team_data["manager_id"],
        manager_name=team_data["manager_name"],
        department=team_data["department"],
        department_id=team_data["department_id"],
        direct_reports_count=team_data["team_size"],
        direct_reports=team_data["direct_reports"]
    )
