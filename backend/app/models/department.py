from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employees = relationship("Employee", back_populates="department_rel", foreign_keys="Employee.department_id")
