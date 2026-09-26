"""Skill Gap Analysis and Resource Matching Service

Server-side engine matching the heuristic from DevelopmentPath.jsx, with
seamless upgrade path to vector embedding semantic matching via Ollama.
"""
from typing import List, Dict, Any, Optional
from app.models.competency import Skill, EmployeeSkillScore
from app.ai.embeddings import OllamaSemanticMatcher


matcher = OllamaSemanticMatcher()


def compute_skill_gap(current_score: int, target_score: int) -> Dict[str, Any]:
    """Computes delta and urgency flags."""
    gap = max(0, target_score - current_score)
    is_opportunity = gap > 10
    is_exceeds = current_score >= target_score
    return {
        "gap": gap,
        "isOpportunity": is_opportunity,
        "isExceeds": is_exceeds
    }


def match_resources_heuristic(
    skill_name: str,
    category: str,
    catalog: List[Dict[str, Any]],
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Keyword overlap heuristic exactly reproducing DevelopmentPath.jsx:
    - Analyzes skill name & category
    - Maps target domain keywords
    - Scores items in the catalog
    """
    skill_lower = skill_name.lower()
    cat_lower = category.lower()

    target_keys = []
    if "docker" in skill_lower or "container" in skill_lower:
        target_keys = ["python", "ai", "data extraction", "big data", "unit level", "computing"]
    elif "cloud" in skill_lower or "aws" in skill_lower or "gcp" in skill_lower:
        target_keys = ["ai", "big data", "python", "r", "data extraction"]
    elif "react" in skill_lower or "frontend" in skill_lower:
        target_keys = ["data visualization", "visualization", "r", "analytics"]
    elif "microservice" in skill_lower or "node" in skill_lower:
        target_keys = ["ai", "big data", "r", "python"]
    elif "system design" in skill_lower or "architecture" in skill_lower:
        target_keys = ["official statistics", "big data", "data extraction", "analytics"]
    elif "survey" in skill_lower or "sampling" in skill_lower:
        target_keys = ["sampling", "survey", "official statistics", "unit level", "nss"]
    elif "national accounts" in skill_lower or "price" in skill_lower:
        target_keys = ["national accounts", "price statistics", "cpi", "gdp", "economic statistics"]
    else:
        target_keys = [w for w in skill_lower.split() if len(w) > 3]

    scored = []
    for item in catalog:
        title_lower = (item.get("title") or "").lower()
        desc_lower = (item.get("description") or "").lower()
        topics_lower = [t.lower() for t in (item.get("topics") or [])]
        skills_lower = [s.lower() for s in (item.get("relatedSkills") or item.get("related_skills") or [])]
        keywords_lower = [k.lower() for k in (item.get("keywords") or [])]

        score = 0
        for key in target_keys:
            if any(key in k for k in keywords_lower):
                score += 5
            if any(key in t for t in topics_lower):
                score += 4
            if any(key in s for s in skills_lower):
                score += 3
            if key in title_lower:
                score += 2
            if key in desc_lower:
                score += 1

        if score > 0:
            scored.append({
                **item,
                "heuristic_score": score,
                "matchScore": min(98, max(75, 75 + score * 3))
            })

    scored.sort(key=lambda x: x["heuristic_score"], reverse=True)
    return scored[:top_k] if scored else catalog[:top_k]


async def match_resources_for_skill(
    skill_name: str,
    category: str,
    catalog: List[Dict[str, Any]],
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Hybrid matching: Attempts vector embedding semantic match,
    falling back seamlessly to the keyword heuristic.
    """
    query = f"{skill_name} {category}"
    results = await matcher.match_resources(query, catalog, top_k=top_k)
    if not results or all(r.get("match_score", 0) < 50 for r in results):
        return match_resources_heuristic(skill_name, category, catalog, top_k=top_k)
    return results
