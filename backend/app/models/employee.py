from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "EMP-2048"
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    designation = Column(String(150), nullable=True)
    department = Column(String(150), default="Engineering & Digital Transformation")
    role_title = Column(String(150), default="Junior Full Stack Developer")
    target_role = Column(String(150), default="Senior Cloud Applications Engineer")
    education = Column(String(200), nullable=True)
    experience_years = Column(Float, default=2.0)
    avatar_url = Column(String(500), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")

    # Snapshot / Cached KPI metrics to match frontend Dashboard/KpiStatsRow/ProfileView
    readiness_score = Column(Integer, default=78)
    skill_index = Column(Integer, default=82)
    completed_courses_count = Column(Integer, default=14)
    pending_assessments_count = Column(Integer, default=2)
    weekly_goal_hours = Column(Float, default=6.0)
    weekly_hours_logged = Column(Float, default=4.5)

    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    skill_scores = relationship("EmployeeSkillScore", back_populates="employee", cascade="all, delete-orphan")
    score_history = relationship("CompetencyScoreHistory", back_populates="employee", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="employee", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="employee", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="employee", cascade="all, delete-orphan")
    ai_insights = relationship("AiInsight", back_populates="employee", cascade="all, delete-orphan")
