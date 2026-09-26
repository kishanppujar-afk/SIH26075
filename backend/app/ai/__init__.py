from app.ai.base import CompetencyAnalyzer, MCQGenerator, SemanticMatcher, FeedbackGenerator
from app.ai.local_llm import OllamaCompetencyAnalyzer, OllamaMCQGenerator, OllamaFeedbackGenerator
from app.ai.fallback import FallbackCompetencyAnalyzer, FallbackMCQGenerator, FallbackFeedbackGenerator
from app.ai.embeddings import OllamaSemanticMatcher, cosine_similarity

__all__ = [
    "CompetencyAnalyzer",
    "MCQGenerator",
    "SemanticMatcher",
    "FeedbackGenerator",
    "OllamaCompetencyAnalyzer",
    "OllamaMCQGenerator",
    "OllamaFeedbackGenerator",
    "FallbackCompetencyAnalyzer",
    "FallbackMCQGenerator",
    "FallbackFeedbackGenerator",
    "OllamaSemanticMatcher",
    "cosine_similarity",
]
