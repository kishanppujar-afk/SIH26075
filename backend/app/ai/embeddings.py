"""Semantic Embeddings and Vector Search with nomic-embed-text

Uses local Ollama's nomic-embed-text model to compute dense 768-dimensional embeddings.
Provides fast cosine-similarity ranking and falls back cleanly to keyword/topic matching.
"""
import logging
from typing import List, Dict, Any, Optional
import httpx
import numpy as np
from app.core.config import settings
from app.ai.base import SemanticMatcher

logger = logging.getLogger(__name__)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


class OllamaSemanticMatcher(SemanticMatcher):
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                    json={
                        "model": settings.OLLAMA_EMBEDDING_MODEL,
                        "prompt": text[:2000]
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    embedding = data.get("embedding")
                    if embedding and isinstance(embedding, list):
                        return embedding
        except Exception as e:
            logger.warning(f"Ollama embedding generation unavailable ({e}).")
        return None

    async def match_resources(
        self,
        query: str,
        resources: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        query_embedding = await self.get_embedding(query)

        if query_embedding:
            scored = []
            for item in resources:
                item_embedding = item.get("embedding")
                if item_embedding:
                    sim = cosine_similarity(query_embedding, item_embedding)
                    match_score = int(max(0.0, min(1.0, sim)) * 100)
                else:
                    match_score = self._compute_lexical_score(query, item)
                
                scored.append({
                    **item,
                    "match_score": match_score,
                    "match_type": "semantic" if item_embedding else "lexical"
                })

            scored.sort(key=lambda x: x["match_score"], reverse=True)
            return scored[:top_k]

        # Lexical fallback
        return self._fallback_keyword_match(query, resources, top_k)

    def _compute_lexical_score(self, query: str, item: Dict[str, Any]) -> int:
        q_lower = query.lower()
        q_tokens = set(q_lower.split())

        title_lower = (item.get("title") or "").lower()
        desc_lower = (item.get("description") or "").lower()
        topics = [t.lower() for t in (item.get("topics") or [])]
        keywords = [k.lower() for k in (item.get("keywords") or [])]
        skills = [s.lower() for s in (item.get("related_skills") or item.get("relatedSkills") or [])]

        score = 0
        if q_lower in title_lower:
            score += 45
        if any(q_lower in t for t in topics):
            score += 30
        if any(q_lower in k for k in keywords):
            score += 25
        if any(q_lower in s for s in skills):
            score += 25

        # Token overlap
        text_corpus = f"{title_lower} {desc_lower} {' '.join(topics)} {' '.join(keywords)}"
        for token in q_tokens:
            if len(token) > 2 and token in text_corpus:
                score += 10

        return min(98, max(50, score)) if score > 0 else 40

    def _fallback_keyword_match(
        self,
        query: str,
        resources: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        scored = []
        for item in resources:
            score = self._compute_lexical_score(query, item)
            scored.append({
                **item,
                "match_score": score,
                "match_type": "lexical"
            })
        scored.sort(key=lambda x: x["match_score"], reverse=True)
        return scored[:top_k]
