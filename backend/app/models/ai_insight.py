from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class AiInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "ins1", "ins2"
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # "Opportunity", "Streak", "Recommendation"
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="ai_insights")
