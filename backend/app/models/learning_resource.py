from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=False)
    source = Column(String(50), nullable=False, index=True)  # "NSSTA", "MoSPI", "iGOT"
    url = Column(String(500), nullable=False)
    resource_type = Column(String(100), default="Course")  # Course, Workshop, Hands-on Lab, Annual Calendar, Publication
    duration_label = Column(String(50), default="Self-paced")  # e.g. "4.5 hrs", "6.0 hrs", "1 Week"
    keywords = Column(JSON, default=list)  # list of str
    topics = Column(JSON, default=list)  # list of str
    related_skills = Column(JSON, default=list)  # list of str
    embedding = Column(JSON, nullable=True)  # list of float from nomic-embed-text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recommendations = relationship("Recommendation", back_populates="learning_resource")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "rec1"
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    skill_id = Column(String(50), ForeignKey("skills.id"), nullable=True, index=True)
    learning_resource_id = Column(String(100), ForeignKey("learning_resources.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(300), nullable=False)
    type = Column(String(100), default="Course")  # Course, Hands-on Lab, Workshop
    provider = Column(String(150), default="SkillStat Academy")
    duration = Column(String(50), default="4.5 hrs")
    impact_skill = Column(String(150), nullable=False)
    match_score = Column(Integer, default=90)
    reason = Column(Text, nullable=True)  # "Recommended because your {skill} assessment result is {gap} points below..."
    is_urgent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="recommendations")
    learning_resource = relationship("LearningResource", back_populates="recommendations")
