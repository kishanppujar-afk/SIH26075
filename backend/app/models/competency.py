from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class CompetencyDomain(Base):
    __tablename__ = "competency_domains"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "dom-statistical", "dom-technical"
    name = Column(String(100), nullable=False, unique=True)  # Statistical, Technical, Digital Governance, Behavioural-Managerial
    description = Column(String(500), nullable=True)

    skills = relationship("Skill", back_populates="domain", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "s1", "s2", "skill-survey-design"
    name = Column(String(150), nullable=False, index=True)
    domain_id = Column(String(50), ForeignKey("competency_domains.id"), nullable=True)
    category = Column(String(100), nullable=False, index=True)  # Technical, Cloud & DevOps, Architecture, Soft Skills, Statistical, Digital Governance, Behavioural-Managerial
    description = Column(String(500), nullable=True)

    domain = relationship("CompetencyDomain", back_populates="skills")
    employee_scores = relationship("EmployeeSkillScore", back_populates="skill", cascade="all, delete-orphan")
    score_history = relationship("CompetencyScoreHistory", back_populates="skill", cascade="all, delete-orphan")


class EmployeeSkillScore(Base):
    __tablename__ = "employee_skill_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    skill_id = Column(String(50), ForeignKey("skills.id"), nullable=False, index=True)
    current_score = Column(Integer, default=50)
    target_score = Column(Integer, default=85)
    status = Column(String(50), default="Growth Opportunity")  # Proficient, Growth Opportunity, On Track, Exceeds Target
    trending = Column(String(20), default="neutral")  # up, neutral, down
    last_assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="skill_scores")
    skill = relationship("Skill", back_populates="employee_scores")


class CompetencyScoreHistory(Base):
    __tablename__ = "competency_score_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    skill_id = Column(String(50), ForeignKey("skills.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    source = Column(String(50), default="assessment")  # assessment, manual, seed
    assessment_attempt_id = Column(String(50), ForeignKey("assessment_attempts.id", ondelete="SET NULL"), nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    employee = relationship("Employee", back_populates="score_history")
    skill = relationship("Skill", back_populates="score_history")
