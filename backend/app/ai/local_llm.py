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
    FallbackFeedbackGenerator,
    FallbackDishaChat
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
        prompt = f"""You are an expert AI competency advisor for officials in the Ministry of Earth Sciences (MoES) and India Meteorological Department.
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
        topic_str = topic or "Meteorological & Earth Sciences Competency"

        prompt = f"""You are a technical assessment author for the Ministry of Earth Sciences and IMD.
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

    async def generate_single_mcq_from_chunk(
        self,
        chunk_text: str,
        topic: Optional[str] = None,
        focus_angle: Optional[str] = None,
        avoid_questions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generates 1 targeted multiple-choice question strictly grounded in a single chunk snippet.
        Falls back cleanly to FallbackMCQGenerator if Ollama is unreachable.
        Uses focus_angle and avoid_questions to ensure distinct questions when a chunk is sampled more than once.
        """
        truncated_snippet = chunk_text[:2500] if len(chunk_text) > 2500 else chunk_text
        topic_str = topic or "Meteorological & Earth Sciences Training Material"

        avoid_clause = ""
        if avoid_questions:
            questions_list = "\n".join(f"- {q}" for q in avoid_questions)
            avoid_clause = f"\nCRITICAL: Do NOT generate a question similar to the following previously generated question(s) from this material:\n{questions_list}\nYou MUST test a completely DIFFERENT fact, procedure, or concept from the snippet."

        angle_clause = ""
        if focus_angle:
            angle_clause = f"\nPERSPECTIVE/FOCUS: Specifically focus on {focus_angle}."

        prompt = f"""You are an assessment specialist for the Ministry of Earth Sciences and IMD.
Create exactly 1 diagnostic multiple-choice question strictly based on the following training document snippet.

Topic: {topic_str}

Source Document Snippet:
\"\"\"{truncated_snippet}\"\"\"{angle_clause}{avoid_clause}

Requirements:
1. Question must directly test understanding of key facts, methods, or requirements in the snippet.
2. Provide exactly 4 options (Option A, B, C, D).
3. Specify the correct_option_index (0, 1, 2, or 3).
4. Provide a concise explanation citing the snippet.
5. In source_snippet, include the key sentence or phrase from the snippet that justifies the answer.

Respond ONLY with valid JSON conforming to this schema:
{{
  "question_text": "Diagnostic question text based on the snippet",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_option_index": 0,
  "explanation": "Explanation why this option is correct based on the snippet",
  "source_snippet": "Key sentence from snippet"
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
                    opts = parsed.get("options", [])
                    if len(opts) == 4 and "question_text" in parsed:
                        clean_q = {
                            "question_text": parsed["question_text"],
                            "options": [str(o) for o in opts],
                            "correct_option_index": int(parsed.get("correct_option_index", 0)) % 4,
                            "explanation": parsed.get("explanation", ""),
                            "source_snippet": parsed.get("source_snippet") or chunk_text[:250]
                        }
                        return {
                            "question": clean_q,
                            "generated_by": "local_llm"
                        }
        except Exception as e:
            logger.warning(f"Ollama chunk MCQ generation failed ({e}). Falling back.")

        return await self.fallback.generate_single_mcq_from_chunk(chunk_text, topic, focus_angle, avoid_questions)


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


class OllamaDishaChat:
    def __init__(self):
        self.fallback = FallbackDishaChat()

    async def generate_chat_response(
        self,
        employee_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_message: str
    ) -> Dict[str, Any]:
        emp_name = employee_context.get("name", "Officer")
        target_role = employee_context.get("target_role", "Senior Statistical Officer")
        department = employee_context.get("department", "Statistics & Planning")
        readiness_score = employee_context.get("readiness_score", 78)
        skill_index = employee_context.get("skill_index", 72)

        gaps_lines = []
        for g in employee_context.get("top_gaps", []):
            gaps_lines.append(f"- {g['skill_name']}: Current {g['current_score']}%, Target {g['target_score']}%, Delta {g['gap']} pts (Status: {g['status']})")
        gaps_str = "\n".join(gaps_lines) if gaps_lines else "No significant skill gaps recorded."

        recs_lines = []
        for r in employee_context.get("recommendations", []):
            recs_lines.append(f"- \"{r['title']}\" ({r.get('provider', 'NSSTA/MoSPI')} · {r.get('type', 'Course')}) -> Targets: {r.get('impact_skill', 'Skill')}")
        recs_str = "\n".join(recs_lines) if recs_lines else "No specific recommendations queued."

        assessments_lines = []
        for a in employee_context.get("recent_assessments", []):
            assessments_lines.append(f"- Completed: {a.get('assessment_title', 'Assessment')} (Score: {a.get('score', 0):.0f}%)")
        assessments_str = "\n".join(assessments_lines) if assessments_lines else "No recent diagnostic assessments recorded."

        # Format history
        history_lines = []
        for turn in conversation_history[-4:]:
            role = "User" if turn.get("role") == "user" else "Disha"
            history_lines.append(f"{role}: {turn.get('content', '')}")
        history_str = "\n".join(history_lines) if history_lines else "No prior turns."

        prompt = f"""You are Disha (दिशा), an AI competency and learning navigation advisor for officials in the Ministry of Earth Sciences (MoES) and India Meteorological Department using SkillStat AI.
Your purpose is to provide clear, helpful, and accurate guidance for the official's professional learning journey.

Tone & Style Guidelines:
- Concise, professional, conversational, and direct.
- FIRST AND FOREMOST: Answer the user's specific question directly.
  * If the user asks for your name or identity, state clearly that you are Disha (दिशा), the AI competency and learning navigation guide on SkillStat AI.
  * If the user asks what "Skill Index" is, explain that Skill Index (currently {skill_index} on their profile) is a 0-100 weighted metric measuring demonstrated proficiency across all assessed competency domains (Statistical, Technical, Digital Governance, Behavioural).
  * If the user asks what "Readiness Score" is, explain that Readiness Score (currently {readiness_score}%) measures their overall alignment toward the {target_role} baseline benchmark.
  * If the user asks about skill gaps, recommendations, or next steps, reference their profile data below.
- Do NOT force skill gap statistics or assessment reminders into responses where they are irrelevant (e.g. simple greetings, identity questions, or conceptual questions).
- Only reference specific training modules or assessments from the Official Profile Context below. NEVER invent or hallucinate fake courses, codes, or URLs.

Official Profile Context:
- Officer Name: {emp_name}
- Department: {department}
- Target Role: {target_role}
- Overall Readiness Score: {readiness_score}%
- Skill Index: {skill_index}
- Top Competency Gaps:
{gaps_str}
- Official Recommended Training Modules:
{recs_str}
- Recent Diagnostic Assessments:
{assessments_str}

Conversation History:
{history_str}

User: {user_message}
Disha:"""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    raw_text = data.get("response", "").strip()
                    if raw_text:
                        return {
                            "response": raw_text,
                            "generated_by": "local_llm"
                        }
        except Exception as e:
            logger.warning(f"Ollama Disha chat generation unavailable ({e}). Using deterministic fallback.")

        return await self.fallback.generate_chat_response(employee_context, conversation_history, user_message)



