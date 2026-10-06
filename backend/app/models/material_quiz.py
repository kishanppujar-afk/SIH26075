from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class UploadedMaterial(Base):
    __tablename__ = "uploaded_materials"

    id = Column(String(50), primary_key=True, index=True)
    uploaded_by = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    associated_course_topic = Column(String(200), nullable=True)
    extracted_text = Column(Text, nullable=True)
    status = Column(String(50), default="uploaded")  # uploaded, processing, processed, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime, nullable=True)

    quizzes = relationship("GeneratedQuiz", back_populates="material", cascade="all, delete-orphan")
    chunks = relationship("MaterialChunk", back_populates="material", cascade="all, delete-orphan", order_by="MaterialChunk.chunk_index")


class MaterialChunk(Base):
    __tablename__ = "material_chunks"

    id = Column(String(50), primary_key=True, index=True)
    material_id = Column(String(50), ForeignKey("uploaded_materials.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # List[float] embedding from nomic-embed-text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime, nullable=True)

    material = relationship("UploadedMaterial", back_populates="chunks")


class GeneratedQuiz(Base):
    __tablename__ = "generated_quizzes"

    id = Column(String(50), primary_key=True, index=True)
    source_material_id = Column(String(50), ForeignKey("uploaded_materials.id"), nullable=True)
    title = Column(String(255), nullable=False)
    generated_by = Column(String(50), default="local_llm")  # "local_llm" or "template_fallback"
    is_published = Column(Boolean, default=False)
    published_assessment_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime, nullable=True)

    material = relationship("UploadedMaterial", back_populates="quizzes")
    questions = relationship("GeneratedQuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class GeneratedQuizQuestion(Base):
    __tablename__ = "generated_quiz_questions"

    id = Column(String(50), primary_key=True, index=True)
    quiz_id = Column(String(50), ForeignKey("generated_quizzes.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # list of strings: ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index = Column(Integer, nullable=False)  # 0, 1, 2, 3
    explanation = Column(Text, nullable=True)
    source_snippet = Column(Text, nullable=True)

    quiz = relationship("GeneratedQuiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(50), primary_key=True, index=True)
    quiz_id = Column(String(50), ForeignKey("generated_quizzes.id"), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)  # Percentage 0.0 - 100.0
    feedback_text = Column(Text, nullable=True)

    quiz = relationship("GeneratedQuiz", back_populates="attempts")
    employee = relationship("Employee", back_populates="quiz_attempts")
    answers = relationship("QuizAnswer", back_populates="attempt", cascade="all, delete-orphan")


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(String(50), ForeignKey("quiz_attempts.id"), nullable=False, index=True)
    question_id = Column(String(50), ForeignKey("generated_quiz_questions.id"), nullable=False)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, default=False)

    attempt = relationship("QuizAttempt", back_populates="answers")
