"""Local Ollama LLM Implementation (gemma3:4b)

Communicates with the local Ollama instance at http://localhost:11434.
Generates structured JSON for MCQs, gap analysis, and personalized feedback.
Gracefully falls back to deterministic template logic if Ollama is unavailable.
"""
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.ai.base import CompetencyAnalyzer, MCQGenerator, FeedbackGenerator
from app.ai.fallback import (
    FallbackCompetencyAnalyzer,
    FallbackMCQGenerator,
    FallbackFeedbackGenerator
)

logger = logging.getLogger(__name__)


class OllamaCompetencyAnalyzer(CompetencyAnalyzer):
    def __init__(self):
        self.fallback = FallbackCompetencyAnalyzer()

    async def analyze_gap(
        self,
        skill_name: str,
        current_score: int,
        target_score: int,
        target_role: str,
        department: str
    ) -> Dict[str, Any]:
        prompt = f"""You are an expert AI competency advisor for officials in India's Official Statistical System (MoSPI/NSSTA).
Analyze this skill gap and respond ONLY with valid JSON.

Employee Information:
- Department: {department}
- Target Role: {target_role}
- Skill: {skill_name}
- Current Score: {current_score}%
- Target Benchmark: {target_score}%
- Delta/Gap: {max(0, target_score - current_score)} points

Generate a JSON object with exactly these keys:
{{
  "reason": "Clear explanation starting with 'Recommended because...'",
  "impact_summary": "1-2 sentences on how closing this gap advances the employee toward the target role",
  "suggested_actions": ["Action 1", "Action 2", "Action 3"]
}}"""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    raw_text = data.get("response", "{}")
                    parsed = json.loads(raw_text)
                    gap = max(0, target_score - current_score)
                    return {
                        "reason": parsed.get("reason", f"Recommended because your {skill_name} score is {gap} points below the required {target_role} baseline."),
                        "impact_summary": parsed.get("impact_summary", f"Closing this {gap}-point delta strengthens your core capability for {target_role}."),
                        "suggested_actions": parsed.get("suggested_actions", [f"Focus on {skill_name} learning modules"]),
                        "gap": gap,
                        "generated_by": "local_llm"
                    }
        except Exception as e:
            logger.warning(f"Ollama LLM gap analysis unavailable ({e}). Using deterministic fallback.")

        return await self.fallback.analyze_gap(skill_name, current_score, target_score, target_role, department)


class OllamaMCQGenerator(MCQGenerator):
    def __init__(self):
        self.fallback = FallbackMCQGenerator()

    async def generate_mcqs(
        self,
        text: str,
        topic: Optional[str] = None,
        num_questions: int = 5
    ) -> Dict[str, Any]:
        truncated_text = text[:4000] if len(text) > 4000 else text
        topic_str = topic or "Official Statistics & Technical Competency"

        prompt = f"""You are a technical assessment author for India's Official Statistical System.
Create exactly {num_questions} high-quality diagnostic multiple-choice questions based on this text.

Topic: {topic_str}

Source Text:
\"\"\"{truncated_text}\"\"\"

Respond ONLY with valid JSON conforming to this schema:
{{
  "questions": [
    {{
      "question_text": "Scenario-based question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Why Option A is correct and educational context",
      "source_snippet": "Relevant phrase from source text"
    }}
  ]
}}"""

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    parsed = json.loads(data.get("response", "{}"))
                    questions = parsed.get("questions", [])
                    if questions and len(questions) >= 1:
                        # Ensure standard shape
                        clean_questions = []
                        for q in questions[:num_questions]:
                            opts = q.get("options", [])
                            if len(opts) == 4 and "question_text" in q:
                                clean_questions.append({
                                    "question_text": q["question_text"],
                                    "options": [str(o) for o in opts],
                                    "correct_option_index": int(q.get("correct_option_index", 0)) % 4,
                                    "explanation": q.get("explanation", ""),
                                    "source_snippet": q.get("source_snippet")
                                })
                        if clean_questions:
                            return {
                                "questions": clean_questions,
                                "generated_by": "local_llm"
                            }
        except Exception as e:
            logger.warning(f"Ollama MCQ generation unavailable ({e}). Using deterministic fallback.")

        return await self.fallback.generate_mcqs(text, topic, num_questions)


class OllamaFeedbackGenerator(FeedbackGenerator):
    def __init__(self):
        self.fallback = FallbackFeedbackGenerator()

    async def generate_feedback(
        self,
        quiz_title: str,
        score: float,
        question_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        eval_summary = []
        for q in question_evaluations[:6]:
            eval_summary.append({
                "question": q.get("question_text", "")[:100],
                "correct": q.get("is_correct", False),
                "explanation": q.get("explanation", "")[:150]
            })

        prompt = f"""You are an encouraging learning coach for an official in India's National Statistical System.
The official just completed the assessment '{quiz_title}' with a score of {score:.1f}%.

Summary of evaluated questions:
{json.dumps(eval_summary, indent=2)}

Provide a concise, motivating, and actionable 2-3 paragraph coaching evaluation with specific study recommendations.
Respond ONLY with valid JSON:
{{
  "feedback_text": "Your personalized coaching feedback here..."
}}"""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    parsed = json.loads(data.get("response", "{}"))
                    text = parsed.get("feedback_text")
                    if text:
                        return {
                            "feedback_text": text,
                            "generated_by": "local_llm"
                        }
        except Exception as e:
            logger.warning(f"Ollama feedback generation unavailable ({e}). Using deterministic fallback.")

        return await self.fallback.generate_feedback(quiz_title, score, question_evaluations)
