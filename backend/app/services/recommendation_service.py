"""Recommendation Service

Generates actionable course and lab recommendations with transparent justification text.
"""
from typing import List, Dict, Any, Optional
from app.models.learning_resource import Recommendation
from app.ai.local_llm import OllamaCompetencyAnalyzer


analyzer = OllamaCompetencyAnalyzer()


async def generate_recommendation_reason(
    skill_name: str,
    current_score: int,
    target_score: int,
    target_role: str,
    department: str = "Engineering & Digital Transformation"
) -> Dict[str, Any]:
    """Generates human-readable recommendation justification."""
    return await analyzer.analyze_gap(
        skill_name=skill_name,
        current_score=current_score,
        target_score=target_score,
        target_role=target_role,
        department=department
    )


def build_default_recommendation(
    rec_id: str,
    employee_id: str,
    skill_name: str,
    gap: int,
    target_role: str,
    title: str,
    provider: str,
    duration: str,
    rec_type: str = "Course",
    url: Optional[str] = None
) -> Dict[str, Any]:
    """Builds a standardized recommendation dictionary."""
    is_urgent = gap >= 15
    match_score = min(98, max(80, 80 + gap))
    reason = f"Recommended because your {skill_name} assessment result is {gap} points below the required level for {target_role}."

    return {
        "id": rec_id,
        "employee_id": employee_id,
        "title": title,
        "type": rec_type,
        "provider": provider,
        "duration": duration,
        "impact_skill": skill_name,
        "match_score": match_score,
        "reason": reason,
        "is_urgent": is_urgent,
        "url": url
    }
