from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.schemas.employee import TokenResponse, LoginRequest, RegisterRequest, EmployeeResponse, AuthMeResponse
from app.routers.employees import serialize_employee

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
        role=req.role or "trainee",
        status="pending_approval",
        role_title=req.role_title or "Junior Full Stack Developer",
        target_role=req.target_role or "Senior Cloud Applications Engineer",
        department=req.department or "Labour Statistics"
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    if new_emp.status == "pending_approval":
        return TokenResponse(
            access_token="pending",
            token_type="bearer",
            role=new_emp.role,
            employee=serialize_employee(new_emp)
        )

    token = create_access_token(new_emp.id, role=new_emp.role, extra_claims={"department_id": new_emp.department_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=new_emp.role,
        employee=serialize_employee(new_emp)
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    identifier = req.email_or_id.strip()
    emp = db.query(Employee).filter(
        (Employee.email.ilike(identifier)) |
        (Employee.id.ilike(identifier)) |
        (Employee.email.ilike(f"{identifier}@mospi.gov.in"))
    ).first()

    if not emp or not verify_password(req.password, emp.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your username/email and password."
        )

    if emp.status == "pending_approval":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your registration is pending approval by the MoES/IMD Administrator."
        )
    
    if emp.status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your registration has been rejected."
        )

    token = create_access_token(emp.id, role=emp.role, extra_claims={"department_id": emp.department_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=emp.role,
        employee=serialize_employee(emp)
    )


@router.get("/me", response_model=AuthMeResponse)
def get_current_user_profile(current_emp: Employee = Depends(get_current_employee)):
    return AuthMeResponse(
        id=current_emp.id,
        name=current_emp.name,
        email=current_emp.email,
        role=current_emp.role,
        status=current_emp.status,
        system_role=current_emp.role,
        role_title=current_emp.role_title,
        targetRole=current_emp.target_role,
        department=current_emp.department,
        department_id=current_emp.department_id,
        manager_id=current_emp.manager_id,
        avatarUrl=current_emp.avatar_url,
        readinessScore=current_emp.readiness_score,
        skillIndex=current_emp.skill_index,
        completedCoursesCount=current_emp.completed_courses_count,
        pendingAssessmentsCount=current_emp.pending_assessments_count,
        weeklyGoalHours=current_emp.weekly_goal_hours,
        weeklyHoursLogged=current_emp.weekly_hours_logged,
        designation=current_emp.designation,
        education=current_emp.education,
        experience_years=current_emp.experience_years,
        interests=current_emp.interests,
        certificates=current_emp.certificates,
        qualifications=current_emp.qualifications
    )

