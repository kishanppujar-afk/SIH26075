"""AI Integration Boundary - Abstract Base Interfaces

Defines the contract for AI/ML capabilities across SkillStat AI:
- CompetencyAnalyzer: Analyzes skill profiles, gaps, and role readiness.
- MCQGenerator: Extracts questions from training documents.
- SemanticMatcher: Calculates vector embeddings and cosine similarity between queries/skills and learning resources.
- FeedbackGenerator: Generates personalized coaching guidance and quiz reviews.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class CompetencyAnalyzer(ABC):
    @abstractmethod
    async def analyze_gap(
        self,
        skill_name: str,
        current_score: int,
        target_score: int,
        target_role: str,
        department: str
    ) -> Dict[str, Any]:
        """
        Analyze the gap between an employee's current skill level and the target role benchmark.

        Returns:
            Dict containing:
                - reason: str (human-readable explanation for recommendation)
                - impact_summary: str
                - suggested_actions: List[str]
                - generated_by: str ("local_llm" or "template_fallback")
        """
        pass


class MCQGenerator(ABC):
    @abstractmethod
    async def generate_mcqs(
        self,
        text: str,
        topic: Optional[str] = None,
        num_questions: int = 5
    ) -> Dict[str, Any]:
        """
        Generate multiple-choice diagnostic questions from extracted training material.

        Args:
            text: Raw extracted document text.
            topic: Optional domain topic/subject.
            num_questions: Number of questions to generate.

        Returns:
            Dict containing:
                - questions: List[Dict] with fields:
                    - question_text: str
                    - options: List[str] (4 options)
                    - correct_option_index: int (0-3)
                    - explanation: str
                    - source_snippet: Optional[str]
                - generated_by: str ("local_llm" or "template_fallback")
        """
        pass


class SemanticMatcher(ABC):
    @abstractmethod
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Compute embedding vector for text using nomic-embed-text.

        Returns:
            List[float] vector or None if embedding model is unavailable.
        """
        pass

    @abstractmethod
    async def match_resources(
        self,
        query: str,
        resources: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Rank learning resources against a query or skill using vector cosine similarity.
        Falls back to lexical keyword matching if embeddings are unavailable.

        Returns:
            List of resource dicts augmented with match_score (0-100) and match_type ("semantic" or "lexical").
        """
        pass


class FeedbackGenerator(ABC):
    @abstractmethod
    async def generate_feedback(
        self,
        quiz_title: str,
        score: float,
        question_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate contextual coaching guidance after quiz or assessment submission.

        Returns:
            Dict containing:
                - feedback_text: str
                - generated_by: str ("local_llm" or "template_fallback")
        """
        pass
