from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_employee
from app.models.employee import Employee
from app.services.trainer_matcher_service import match_trainers

router = APIRouter(prefix="/competency", tags=["Competency Mapping"])

class MatchRequest(BaseModel):
    subject: str

@router.post("/match-trainers")
def match_trainers_endpoint(
    req: MatchRequest,
    db: Session = Depends(get_db),
    current_emp: Employee = Depends(get_current_employee)
):
    if current_emp.role != "admin" and not current_emp.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    results = match_trainers(db, req.subject)
    return results
