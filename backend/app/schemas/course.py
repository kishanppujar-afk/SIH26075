from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class RecommendationResponse(BaseModel):
    id: str
    title: str
    type: str
    provider: str
    duration: str
    impactSkill: str = Field(..., serialization_alias="impactSkill")
    matchScore: int = Field(..., serialization_alias="matchScore")
    isUrgent: bool = Field(..., serialization_alias="isUrgent")
    reason: Optional[str] = None
    url: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class LearningResourceResponse(BaseModel):
    id: str
    title: str
    description: str
    source: str
    url: str
    keywords: List[str] = []
    topics: List[str] = []
    relatedSkills: List[str] = Field(default_factory=list, serialization_alias="relatedSkills")
    resource_type: Optional[str] = "Course"
    duration_label: Optional[str] = "Self-paced"

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
