from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CourseEnrollmentResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    status: str
    enrolled_at: datetime
    completed_at: Optional[datetime]
    progress_percent: float

    model_config = ConfigDict(from_attributes=True)

class CourseFeedbackCreate(BaseModel):
    rating: int
    clarity_score: Optional[int] = None
    relevance_score: Optional[int] = None
    comment: Optional[str] = None

class CourseFeedbackResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    rating: int
    clarity_score: Optional[int]
    relevance_score: Optional[int]
    comment: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TrainerLibraryItemUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None

class TrainerLibraryItemCreate(BaseModel):
    title: str
    subject: Optional[str] = None
    resource_type: str
    media_url: Optional[str] = None
    description: Optional[str] = None
    file_size_label: Optional[str] = None

class TrainerLibraryItemResponse(BaseModel):
    id: str
    trainer_id: str
    title: str
    subject: Optional[str]
    resource_type: str
    media_url: Optional[str]
    description: Optional[str]
    file_size_label: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnnouncementCreate(BaseModel):
    title: str
    category: str
    content: Optional[str] = None
    is_active: bool = True

class AnnouncementResponse(BaseModel):
    id: str
    title: str
    category: str
    content: Optional[str]
    published_by: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
