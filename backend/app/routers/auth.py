from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.schemas.employee import TokenResponse, LoginRequest, RegisterRequest, EmployeeResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(
        (Employee.email == req.email) | (Employee.id == (req.id or ""))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email or ID already exists.")

    emp_id = req.id or f"EMP-{int(db.query(Employee).count()) + 2049}"
    hashed = get_password_hash(req.password)

    new_emp = Employee(
        id=emp_id,
        name=req.name,
        email=req.email,
        hashed_password=hashed,
        role_title=req.role_title or "Junior Full Stack Developer",
        target_role=req.target_role or "Senior Cloud Applications Engineer",
        department=req.department or "Engineering & Digital Transformation"
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    token = create_access_token(new_emp.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        employee=EmployeeResponse(
            id=new_emp.id,
            name=new_emp.name,
            role=new_emp.role_title,
            targetRole=new_emp.target_role,
            department=new_emp.department,
            avatarUrl=new_emp.avatar_url,
            readinessScore=new_emp.readiness_score,
            skillIndex=new_emp.skill_index,
            completedCoursesCount=new_emp.completed_courses_count,
            pendingAssessmentsCount=new_emp.pending_assessments_count,
            weeklyGoalHours=new_emp.weekly_goal_hours,
            weeklyHoursLogged=new_emp.weekly_hours_logged,
            email=new_emp.email
        )
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(
        (Employee.email == req.email_or_id) | (Employee.id == req.email_or_id)
    ).first()

    if not emp or not verify_password(req.password, emp.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use 'EMP-2048' and 'password123'."
        )

    token = create_access_token(emp.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        employee=EmployeeResponse(
            id=emp.id,
            name=emp.name,
            role=emp.role_title,
            targetRole=emp.target_role,
            department=emp.department,
            avatarUrl=emp.avatar_url,
            readinessScore=emp.readiness_score,
            skillIndex=emp.skill_index,
            completedCoursesCount=emp.completed_courses_count,
            pendingAssessmentsCount=emp.pending_assessments_count,
            weeklyGoalHours=emp.weekly_goal_hours,
            weeklyHoursLogged=emp.weekly_hours_logged,
            email=emp.email,
            designation=emp.designation,
            education=emp.education,
            experience_years=emp.experience_years
        )
    )


@router.get("/me", response_model=EmployeeResponse)
def get_current_user_profile(current_emp: Employee = Depends(get_current_employee)):
    return EmployeeResponse(
        id=current_emp.id,
        name=current_emp.name,
        role=current_emp.role_title,
        targetRole=current_emp.target_role,
        department=current_emp.department,
        avatarUrl=current_emp.avatar_url,
        readinessScore=current_emp.readiness_score,
        skillIndex=current_emp.skill_index,
        completedCoursesCount=current_emp.completed_courses_count,
        pendingAssessmentsCount=current_emp.pending_assessments_count,
        weeklyGoalHours=current_emp.weekly_goal_hours,
        weeklyHoursLogged=current_emp.weekly_hours_logged,
        email=current_emp.email,
        designation=current_emp.designation,
        education=current_emp.education,
        experience_years=current_emp.experience_years
    )
