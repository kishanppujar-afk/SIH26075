from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


class MaterialUploadResponse(BaseModel):
    id: str
    filename: str
    mime_type: str
    status: str
    extracted_char_count: int
    associated_course_topic: Optional[str] = None


class QuizGenerationRequest(BaseModel):
    title: Optional[str] = None
    num_questions: int = 5


class QuizQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    explanation: Optional[str] = None
    source_snippet: Optional[str] = None


class QuizResponse(BaseModel):
    id: str
    title: str
    generated_by: str  # "local_llm" or "template_fallback"
    created_at: str
    questions: List[QuizQuestionResponse]


class QuizAttemptStartResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    started_at: str


class QuizAttemptSubmitRequest(BaseModel):
    answers: Dict[str, int]  # question_id -> selected_option_index


class QuestionEvaluationResult(BaseModel):
    question_id: str
    question_text: str
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: Optional[str] = None


class QuizAttemptResultResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score: float
    total_questions: int
    correct_count: int
    feedback_text: str
    feedback_generated_by: str  # "local_llm" or "template_fallback"
    question_results: List[QuestionEvaluationResult]
