from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class AssessmentResponse(BaseModel):
    id: str
    title: str
    category: str
    dueDate: Optional[str] = Field(None, serialization_alias="dueDate")
    completedDate: Optional[str] = Field(None, serialization_alias="completedDate")
    estimatedMinutes: int = Field(15, serialization_alias="estimatedMinutes")
    status: str
    questionCount: int = Field(6, serialization_alias="questionCount")
    targetRole: str = Field(..., serialization_alias="targetRole")
    description: str
    baselineLevel: Optional[str] = Field(None, serialization_alias="baselineLevel")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AssessmentOptionResponse(BaseModel):
    id: str
    text: str


class AssessmentQuestionResponse(BaseModel):
    id: str
    topic: str
    competency: str
    scenario: str
    question: str
    options: List[AssessmentOptionResponse]
    uncertaintyOption: Optional[AssessmentOptionResponse] = Field(None, serialization_alias="uncertaintyOption")
    correctOptionId: Optional[str] = Field(None, serialization_alias="correctOptionId")
    rationale: Optional[str] = None
    growthResource: Optional[Dict[str, Any]] = Field(None, serialization_alias="growthResource")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AttemptStartResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    status: str
    started_at: str


class AnswerSubmitRequest(BaseModel):
    question_id: str
    selected_option_id: str


class AssessmentCapabilityItem(BaseModel):
    name: str
    score: int
    target: int = 85
    status: str


class ConfidentCorrectItem(BaseModel):
    id: str
    topic: str
    competency: str
    question: str
    rationale: Optional[str] = None


class GrowthOpportunityItem(BaseModel):
    id: str
    topic: str
    competency: str
    question: str
    rationale: Optional[str] = None
    growthResource: Optional[Dict[str, Any]] = None
    isUncertain: bool = False


class AssessmentSubmissionResult(BaseModel):
    attempt_id: str
    overallScore: float
    baselineLevel: str
    capabilityList: List[AssessmentCapabilityItem]
    confidentCorrect: List[ConfidentCorrectItem]
    growthOpportunities: List[GrowthOpportunityItem]
