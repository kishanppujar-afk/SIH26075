from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class SkillResponse(BaseModel):
    id: str
    name: str
    category: str
    currentScore: int = Field(..., serialization_alias="currentScore")
    targetScore: int = Field(..., serialization_alias="targetScore")
    status: str
    trending: str
    description: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class CompetencyDomainResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DevelopmentPathResponse(BaseModel):
    skill: SkillResponse
    gap: int
    isOpportunity: bool
    isExceeds: bool
    recommendedResources: List[dict]
    linkedAssessment: Optional[dict] = None


class ProgressRecord(BaseModel):
    skill_id: str
    skill_name: str
    score: int
    source: str
    recorded_at: str


class ProgressResponse(BaseModel):
    history: List[ProgressRecord]
    readinessScoreTrend: List[dict]
    currentReadinessScore: int
    currentSkillIndex: int


class GrowthStageResponse(BaseModel):
    stage: int
    name: str
    title: str
    description: str
    readinessScore: int
    blossomPercentage: int
