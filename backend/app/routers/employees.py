from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.schemas.employee import EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["Employees"])


def serialize_employee(emp: Employee) -> EmployeeResponse:
    return EmployeeResponse(
        id=emp.id,
        name=emp.name,
        role=emp.role, # Fixed to use system role so frontend logic works
        status=emp.status,
        system_role=emp.role,
        role_title=emp.role_title,
        targetRole=emp.target_role or "Senior Statistical Officer",
        department=emp.department or "Labour Statistics",
        department_id=emp.department_id,
        manager_id=emp.manager_id,
        avatarUrl=emp.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        readinessScore=emp.readiness_score or 75,
        skillIndex=emp.skill_index or 70,
        completedCoursesCount=emp.completed_courses_count or 0,
        pendingAssessmentsCount=emp.pending_assessments_count or 0,
        weeklyGoalHours=emp.weekly_goal_hours or 6.0,
        weeklyHoursLogged=emp.weekly_hours_logged or 0.0,
        email=emp.email,
        designation=emp.designation,
        education=emp.education,
        experience_years=emp.experience_years,
        interests=emp.interests,
        certificates=emp.certificates,
        qualifications=emp.qualifications
    )


@router.get("/me", response_model=EmployeeResponse)
def get_my_profile(current_emp: Employee = Depends(get_current_employee)):
    """Returns employee profile in the exact shape consumed by Dashboard, ProfileView, and KpiStatsRow."""
    return serialize_employee(current_emp)


@router.patch("/me", response_model=EmployeeResponse)
def update_my_profile(
    update_data: EmployeeUpdate,
    current_emp: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Updates target role, study goals, or display details."""
    if update_data.name is not None:
        current_emp.name = update_data.name
    if update_data.role_title is not None:
        current_emp.role_title = update_data.role_title
    if update_data.target_role is not None:
        current_emp.target_role = update_data.target_role
    if update_data.department is not None:
        current_emp.department = update_data.department
    if update_data.weekly_goal_hours is not None:
        current_emp.weekly_goal_hours = update_data.weekly_goal_hours
    if update_data.weekly_hours_logged is not None:
        current_emp.weekly_hours_logged = update_data.weekly_hours_logged
    if update_data.interests is not None:
        current_emp.interests = update_data.interests
    if update_data.certificates is not None:
        current_emp.certificates = update_data.certificates
    if update_data.qualifications is not None:
        current_emp.qualifications = update_data.qualifications

    db.commit()
    db.refresh(current_emp)
    return serialize_employee(current_emp)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_by_id(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    return serialize_employee(emp)
