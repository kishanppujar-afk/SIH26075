import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.models.capacity_connect import Announcement
from app.schemas.employee import EmployeeResponse
from app.schemas.capacity_connect import AnnouncementCreate, AnnouncementResponse
from app.routers.employees import serialize_employee

router = APIRouter(prefix="/admin", tags=["Admin CMS"])

def check_admin(emp: Employee):
    if emp.role != "admin" and not emp.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")

@router.get("/pending-users", response_model=list[EmployeeResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_admin(current_emp)
    users = db.query(Employee).filter(Employee.status == "pending_approval").all()
    return [serialize_employee(u) for u in users]

@router.post("/users/{user_id}/approve")
def approve_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_admin(current_emp)
    user = db.query(Employee).filter(Employee.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "approved"
    db.commit()
    return {"message": "User approved successfully"}

@router.post("/users/{user_id}/reject")
def reject_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_admin(current_emp)
    user = db.query(Employee).filter(Employee.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "rejected"
    db.commit()
    return {"message": "User rejected successfully"}

@router.post("/users/{user_id}/assign-role")
def assign_role(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_admin(current_emp)
    if role not in ["trainee", "trainer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(Employee).filter(Employee.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}

@router.get("/homepage/feed", response_model=list[AnnouncementResponse])
def get_homepage_feed(db: Session = Depends(get_db)):
    announcements = db.query(Announcement).filter(Announcement.is_active == True).order_by(Announcement.created_at.desc()).all()
    return announcements

@router.post("/announcements", response_model=AnnouncementResponse)
def publish_announcement(
    ann_create: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    check_admin(current_emp)
    ann_id = f"ANN-{uuid.uuid4().hex[:8]}"
    announcement = Announcement(
        id=ann_id,
        title=ann_create.title,
        category=ann_create.category,
        content=ann_create.content,
        published_by=current_emp.id,
        is_active=ann_create.is_active
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement
