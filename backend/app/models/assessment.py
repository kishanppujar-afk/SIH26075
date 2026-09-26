from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "asm1", "asm2", "asm3"
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # Cloud & DevOps, Technical, Process, Statistical, etc.
    description = Column(Text, nullable=True)
    target_role = Column(String(150), default="Senior Cloud Applications Engineer")
    estimated_minutes = Column(Integer, default=15)
    question_count = Column(Integer, default=6)
    due_date = Column(String(50), nullable=True)  # formatted date string or ISO
    completed_date = Column(String(50), nullable=True)
    baseline_level = Column(String(100), nullable=True)  # e.g. "Solid Foundation (88%)"
    status = Column(String(100), default="Ready for Baseline Discovery")  # Ready for Baseline Discovery, Baseline Established

    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "q1"
    assessment_id = Column(String(50), ForeignKey("assessments.id"), nullable=False, index=True)
    topic = Column(String(150), nullable=False)
    competency = Column(String(150), nullable=False)  # Name of competency or skill
    scenario = Column(Text, nullable=False)
    question_text = Column(Text, nullable=False)
    difficulty = Column(String(50), default="intermediate")
    question_type = Column(String(50), default="mcq")
    correct_option_id = Column(String(50), nullable=False)
    rationale = Column(Text, nullable=True)
    growth_resource = Column(JSON, nullable=True)  # {"title": "...", "type": "...", "duration": "..."}

    assessment = relationship("Assessment", back_populates="questions")
    options = relationship("AssessmentOption", back_populates="question", cascade="all, delete-orphan")


class AssessmentOption(Base):
    __tablename__ = "assessment_options"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "q1-a", "q1-unsure"
    question_id = Column(String(50), ForeignKey("assessment_questions.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    is_uncertainty_option = Column(Boolean, default=False)

    question = relationship("AssessmentQuestion", back_populates="options")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(50), primary_key=True, index=True)  # UUID or timestamp string
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    assessment_id = Column(String(50), ForeignKey("assessments.id"), nullable=False, index=True)
    status = Column(String(50), default="in_progress")  # in_progress, completed
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)

    employee = relationship("Employee", back_populates="assessment_attempts")
    assessment = relationship("Assessment", back_populates="attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(String(50), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    question_id = Column(String(50), ForeignKey("assessment_questions.id"), nullable=False)
    selected_option_id = Column(String(50), nullable=True)
    is_correct = Column(Boolean, default=False)
    is_uncertain = Column(Boolean, default=False)

    attempt = relationship("AssessmentAttempt", back_populates="answers")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(String(50), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    skill_name = Column(String(150), nullable=False)
    score = Column(Integer, nullable=False)
    target = Column(Integer, default=85)
    status = Column(String(50), default="On Track")  # Proficient, Growth Opportunity, On Track, Exceeds Target

    attempt = relationship("AssessmentAttempt", back_populates="results")
