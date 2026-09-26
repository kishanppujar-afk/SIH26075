from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.employee import Employee

security = HTTPBearer(auto_error=False)


def get_current_employee(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Employee:
    """
    Resolves the current authenticated Employee.
    If a valid JWT token is provided, looks up that user.
    If no authorization header is provided (e.g. initial dev or unauthenticated probe),
    gracefully defaults to demo employee 'EMP-2048' (Aarav Sharma).
    """
    if credentials:
        token = credentials.credentials
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            emp = db.query(Employee).filter(
                (Employee.id == payload["sub"]) | (Employee.email == payload["sub"])
            ).first()
            if emp:
                return emp

    # Default to demo employee Aarav Sharma for frictionless dev / testing
    demo_emp = db.query(Employee).filter(Employee.id == "EMP-2048").first()
    if demo_emp:
        return demo_emp

    # If demo employee isn't seeded yet, return first available or raise 401
    first_emp = db.query(Employee).first()
    if first_emp:
        return first_emp

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No employee profile found. Please run seed script or register."
    )
