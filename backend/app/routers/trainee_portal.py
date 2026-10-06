import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.capacity_connect import CourseEnrollment, CourseFeedback, TrainerLibraryItem
from app.schemas.capacity_connect import CourseEnrollmentResponse, CourseFeedbackCreate, CourseFeedbackResponse, TrainerLibraryItemResponse

router = APIRouter(prefix="/trainee", tags=["Trainee Portal"])
courses_router = APIRouter(prefix="/courses", tags=["Courses"])

def check_trainee(emp: Employee):
    if emp.role not in ["trainee", "trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Trainee privileges required")
    if emp.status != "approved":
        raise HTTPException(status_code=403, detail="Account not approved")

@courses_router.post("/{course_id}/enroll", response_model=CourseEnrollmentResponse)
def enroll_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    existing = db.query(CourseEnrollment).filter_by(user_id=current_emp.id, course_id=course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    
    enr_id = f"ENR-{uuid.uuid4().hex[:8]}"
    enrollment = CourseEnrollment(
        id=enr_id,
        user_id=current_emp.id,
        course_id=course_id,
        status="pending_approval"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.get("/my-courses", response_model=list[CourseEnrollmentResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_emp.id).all()
    return enrollments

@courses_router.post("/{course_id}/feedback", response_model=CourseFeedbackResponse)
def submit_feedback(
    course_id: str,
    feedback_create: CourseFeedbackCreate,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    fb_id = f"FB-{uuid.uuid4().hex[:8]}"
    feedback = CourseFeedback(
        id=fb_id,
        user_id=current_emp.id,
        course_id=course_id,
        rating=feedback_create.rating,
        clarity_score=feedback_create.clarity_score,
        relevance_score=feedback_create.relevance_score,
        comment=feedback_create.comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@courses_router.get("/{course_id}/feedbacks", response_model=list[CourseFeedbackResponse])
def get_feedbacks(
    course_id: str,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    feedbacks = db.query(CourseFeedback).filter(CourseFeedback.course_id == course_id).all()
    return feedbacks

@router.get("/library", response_model=list[TrainerLibraryItemResponse])
def get_trainer_library(
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    items = db.query(TrainerLibraryItem).all()
    return items



from pydantic import BaseModel
class ProfileUpdate(BaseModel):
    interests: list[str] = []
    qualifications: list[str] = []
    certificates: list[str] = []
    skills: list[str] = []
    experience_years: float = 0.0

@router.put("/profile")
def update_profile(
    update_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_trainee(current_emp)
    current_emp.interests = update_data.interests
    current_emp.qualifications = update_data.qualifications
    current_emp.certificates = update_data.certificates
    current_emp.skills = update_data.skills
    current_emp.experience_years = update_data.experience_years
    db.commit()
    return {"status": "success"}
