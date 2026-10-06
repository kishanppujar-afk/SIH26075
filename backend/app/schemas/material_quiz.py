from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


class MaterialUploadResponse(BaseModel):
    id: str
    filename: str
    mime_type: str
    status: str
    extracted_char_count: int
    associated_course_topic: Optional[str] = None
    chunks_count: Optional[int] = 0


class MaterialChunkResponse(BaseModel):
    id: str
    chunk_index: int
    chunk_text: str
    has_embedding: bool


class MaterialItemResponse(BaseModel):
    id: str
    filename: str
    mime_type: str
    status: str
    char_count: int
    associated_course_topic: Optional[str] = None
    chunks_count: int
    quizzes_count: int
    created_at: str


class QuizGenerationRequest(BaseModel):
    title: Optional[str] = None
    num_questions: int = 5
    deadline: Optional[str] = None


class QuizQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option_index: Optional[int] = None
    explanation: Optional[str] = None
    source_snippet: Optional[str] = None


class QuizResponse(BaseModel):
    id: str
    source_material_id: Optional[str] = None
    title: str
    generated_by: str  # "local_llm" or "template_fallback"
    is_published: bool = False
    published_assessment_id: Optional[str] = None
    created_at: str
    questions: List[QuizQuestionResponse]


class PublishQuizRequest(BaseModel):
    is_published: bool = True


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


class ManualQuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_option_index: int

class ManualQuizCreate(BaseModel):
    title: str
    deadline: Optional[str] = None
    questions: List[ManualQuestionCreate]
