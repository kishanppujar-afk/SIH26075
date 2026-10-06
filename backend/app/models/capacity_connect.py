from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("employees.id"))
    course_id = Column(String(50))
    status = Column(String(50), default="enrolled")  # enrolled, in_progress, completed
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    progress_percent = Column(Float, default=0.0)

    user = relationship("Employee", back_populates="enrollments")


class CourseFeedback(Base):
    __tablename__ = "course_feedbacks"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("employees.id"))
    course_id = Column(String(50))
    rating = Column(Integer)  # 1-5
    clarity_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("Employee", back_populates="course_feedbacks")


class TrainerLibraryItem(Base):
    __tablename__ = "trainer_library_items"

    id = Column(String(50), primary_key=True, index=True)
    trainer_id = Column(String(50), ForeignKey("employees.id"))
    title = Column(String(200), nullable=False)
    subject = Column(String(200), nullable=True)
    resource_type = Column(String(50))  # recorded_lecture, presentation_deck, study_guide
    media_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    file_size_label = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trainer = relationship("Employee", back_populates="trainer_library_items")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50))  # announcement, notification, achievement, new_content
    content = Column(Text, nullable=True)
    published_by = Column(String(50), ForeignKey("employees.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    publisher = relationship("Employee", foreign_keys=[published_by])
