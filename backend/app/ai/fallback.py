"""Deterministic Fallback AI Implementation

Provides rule-based, deterministic responses when the local Ollama LLM is
unreachable, busy, or disabled. Every response is explicitly labeled with:
    "generated_by": "template_fallback"
"""
import re
from typing import List, Dict, Any, Optional
from app.ai.base import CompetencyAnalyzer, MCQGenerator, FeedbackGenerator


class FallbackCompetencyAnalyzer(CompetencyAnalyzer):
    async def analyze_gap(
        self,
        skill_name: str,
        current_score: int,
        target_score: int,
        target_role: str,
        department: str
    ) -> Dict[str, Any]:
        gap = max(0, target_score - current_score)
        if gap == 0:
            reason = f"Maintained proficiency in {skill_name}. Current score ({current_score}%) meets or exceeds the baseline of {target_score}% for {target_role}."
            impact_summary = "Proficiency validated; ready for mentorship or advanced specialization modules."
            suggested_actions = ["Review advanced case studies", "Participate in cross-functional peer reviews"]
        elif gap <= 15:
            reason = f"Recommended because your {skill_name} assessment result is {gap} points below the required benchmark ({target_score}%) for {target_role}."
            impact_summary = f"A targeted refresher in {skill_name} can bridge this {gap}-point delta within 2 to 3 weeks."
            suggested_actions = [
                f"Complete prioritized learning modules in {skill_name}",
                "Attempt the competency checkpoint quiz"
            ]
        else:
            reason = f"Recommended because your {skill_name} assessment result is {gap} points below the required level for {target_role}."
            impact_summary = f"High-yield growth area. Bridging this {gap}-point delta represents a primary milestone for advancement."
            suggested_actions = [
                f"Enroll in foundational and applied courses in {skill_name}",
                "Work on practical lab exercises and unit data projects",
                "Re-assess competency baseline upon completion"
            ]

        return {
            "reason": reason,
            "impact_summary": impact_summary,
            "suggested_actions": suggested_actions,
            "gap": gap,
            "generated_by": "template_fallback"
        }


class FallbackMCQGenerator(MCQGenerator):
    async def generate_mcqs(
        self,
        text: str,
        topic: Optional[str] = None,
        num_questions: int = 5
    ) -> Dict[str, Any]:
        sentences = [
            s.strip() for s in re.split(r'[.!?\n]+', text)
            if len(s.strip()) > 35 and any(c.isalpha() for c in s.strip())
        ]

        topic_label = topic or "Meteorological & Earth Sciences Competency"
        questions = []

        for i in range(min(num_questions, max(1, len(sentences)))):
            seed_sentence = sentences[i % len(sentences)] if sentences else "Meteorological observation systems require robust data validation, metadata standards, and sampling integrity."
            words = [w for w in re.findall(r'\b[A-Za-z]{4,}\b', seed_sentence)]
            key_term = words[0] if words else "Methodology"

            q_item = {
                "question_text": f"During a severe weather event, a forecaster is analyzing {topic_label}. Which of the following procedural actions reflects standard operational practice regarding {key_term}?",
                "options": [
                    seed_sentence,
                    f"Disregard standard {key_term} protocols when processing unit-level statistical aggregates.",
                    f"Delegate {key_term} entirely to external unverified vendors without data validation.",
                    f"Archive preliminary data without recording metadata or provenance standards."
                ],
                "correct_option_index": 0,
                "explanation": f"Based on the provided material: \"{seed_sentence}\"",
                "source_snippet": seed_sentence[:200]
            }
            questions.append(q_item)

        while len(questions) < num_questions:
            idx = len(questions) + 1
            questions.append({
                "question_text": f"What is a primary consideration when evaluating {topic_label} workflows (Concept #{idx})?",
                "options": [
                    f"Ensuring consistency with verified national metadata and quality assurance standards.",
                    f"Bypassing peer review checkpoints to expedite dissemination without auditing.",
                    f"Storing records in unindexed legacy formats without schema definitions.",
                    f"Limiting access exclusively to informal spreadsheet notes."
                ],
                "correct_option_index": 0,
                "explanation": "Standard official statistical practice prioritizes verifiable metadata, data quality, and compliance with national guidelines.",
                "source_snippet": None
            })

        return {
            "questions": questions,
            "generated_by": "template_fallback"
        }

    async def generate_single_mcq_from_chunk(
        self,
        chunk_text: str,
        topic: Optional[str] = None,
        focus_angle: Optional[str] = None,
        avoid_questions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Deterministic fallback for a single chunk: extracts key sentence and builds a 4-option question.
        Varies sentence choice if avoid_questions is provided to prevent duplicates on repeated chunks.
        """
        sentences = [
            s.strip() for s in re.split(r'[.!?\n]+', chunk_text)
            if len(s.strip()) > 30 and any(c.isalpha() for c in s.strip())
        ]
        topic_label = topic or "Official Statistics Competency"
        repeat_offset = len(avoid_questions) if avoid_questions else 0
        if sentences:
            seed_sentence = sentences[repeat_offset % len(sentences)]
        else:
            seed_sentence = (chunk_text.strip()[:180] or "Official procedures require standard data quality assurance.")

        words = re.findall(r'\b[A-Za-z]{4,}\b', seed_sentence)
        key_term = words[repeat_offset % len(words)] if words else "Methodology"

        angle_label = f" ({focus_angle})" if focus_angle else ""
        snippet = seed_sentence[:250]
        q_item = {
            "question_text": f"Based on the provided section regarding {topic_label}{angle_label}, which statement correctly reflects standards for {key_term}?",
            "options": [
                seed_sentence,
                f"Disregard standard {key_term} protocols during statistical production.",
                f"Delegate {key_term} to unverified external vendors without oversight.",
                f"Archive unit-level records without metadata or schema definitions."
            ],
            "correct_option_index": 0,
            "explanation": f"According to the source documentation: \"{snippet}\"",
            "source_snippet": snippet
        }
        return {
            "question": q_item,
            "generated_by": "template_fallback"
        }


class FallbackFeedbackGenerator(FeedbackGenerator):
    async def generate_feedback(
        self,
        quiz_title: str,
        score: float,
        question_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        total = len(question_evaluations)
        correct = sum(1 for q in question_evaluations if q.get("is_correct"))

        if score >= 80:
            narrative = (
                f"Outstanding mastery on '{quiz_title}'! You answered {correct} of {total} questions correctly ({score:.0f}%). "
                "Your foundational and applied knowledge is solid. Continue maintaining momentum with advanced official datasets."
            )
        elif score >= 50:
            narrative = (
                f"Good progress on '{quiz_title}'. You achieved {score:.0f}% ({correct}/{total} correct). "
                "Review the explanations for missed items to reinforce key conceptual boundaries before moving to subsequent modules."
            )
        else:
            narrative = (
                f"Baseline diagnostic recorded for '{quiz_title}' ({score:.0f}%). "
                "This highlights specific learning opportunities. Review the recommended learning resources and retake the checkpoint once completed."
            )

        return {
            "feedback_text": narrative,
            "generated_by": "template_fallback"
        }


class FallbackDishaChat:
    """
    Deterministic rule-based conversational guide for Disha when Ollama is offline.
    Provides targeted direction referencing the employee's actual profile, Skill Index,
    readiness score, gaps, recommendations, and assessments.
    """
    async def generate_chat_response(
        self,
        employee_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_message: str
    ) -> Dict[str, Any]:
        msg_lower = user_message.lower().strip()
        emp_name = employee_context.get("name", "Officer")
        target_role = employee_context.get("target_role", "Senior Statistical Officer")
        readiness_score = employee_context.get("readiness_score", 78)
        skill_index = employee_context.get("skill_index", 70)
        gaps = employee_context.get("top_gaps", [])
        recs = employee_context.get("recommendations", [])
        assessments = employee_context.get("recent_assessments", [])

        # Priority skill gap
        top_gap = gaps[0] if gaps else None
        top_skill_name = top_gap["skill_name"] if top_gap else "Core Competencies"
        top_delta = top_gap["gap"] if top_gap else 0
        top_current = top_gap["current_score"] if top_gap else 0
        top_target = top_gap["target_score"] if top_gap else 85

        # Priority recommended resource
        top_rec = recs[0] if recs else None
        rec_title = top_rec["title"] if top_rec else "Official Competency Learning Modules"

        # 1. Identity & Name questions
        if any(p in msg_lower for p in ["your name", "whats your name", "what is your name", "who are you", "who r u", "who made you", "disha"]):
            response = (
                f"Hello! My name is Disha (दिशा). I am your AI competency and learning navigation advisor "
                f"on SkillStat AI, designed for officials in the Ministry of Earth Sciences (MoES) and India Meteorological Department. "
                f"I track your competency benchmarks for {target_role} and guide your next professional development steps."
            )
        # 2. Skill Index explanation
        elif any(p in msg_lower for p in ["skill index", "what is skill index", "explain skill index", "define skill index"]):
            response = (
                f"The **Skill Index** (currently {skill_index} on your profile) is a 0–100 weighted metric that represents "
                f"your current demonstrated capability across assessed competency domains—Statistical, Technical, Digital Governance, "
                f"and Behavioural. It quantifies your evaluated baseline against official cadre standards."
            )
        # 3. Readiness Score explanation
        elif any(p in msg_lower for p in ["readiness score", "what is readiness", "readiness"]):
            response = (
                f"Your **Readiness Score** (currently {readiness_score}%) measures how closely your current competency profile "
                f"aligns with the required baseline benchmark for your target role of {target_role}. "
                f"Completing verified learning courses and diagnostic assessments will help bridge remaining deltas."
            )
        # 4. Gaps / Weaknesses / Growth priorities
        elif any(w in msg_lower for w in ["gap", "gaps", "weak", "weakness", "growth area", "where should i focus", "what should i improve", "priority"]):
            if top_gap and top_delta > 0:
                response = (
                    f"Hello {emp_name}. Your primary growth priority is **{top_skill_name}**, where your score is currently {top_current}% "
                    f"against the {top_target}% benchmark for {target_role} (a delta of {top_delta} points). "
                    f"Closing this specific gap is essential for role readiness. "
                    f"Next step: Open the Skills tab, select '{top_skill_name}', and review your personalized Development Path."
                )
            else:
                response = (
                    f"Hello {emp_name}. Your assessed competencies are performing strongly against the {target_role} baseline. "
                    f"Next step: Head to the Assessments Hub to discover new baseline discovery tracks."
                )
        # 5. Training / Courses / Recommendations
        elif any(w in msg_lower for w in ["course", "courses", "recommend", "recommendation", "training", "learn", "workshop", "modules", "study"]):
            if top_rec:
                response = (
                    f"For targeted progression, your highest-priority training recommendation is '{rec_title}' "
                    f"({top_rec.get('provider', 'NSSTA/MoSPI')} · {top_rec.get('type', 'Course')}), directly aligned to strengthen {top_rec.get('impact_skill', top_skill_name)}. "
                    f"Next step: Navigate to the Courses tab to access this module and review the syllabus."
                )
            else:
                response = (
                    f"I recommend reviewing official MoSPI and NSSTA catalog programs that align with your target role of {target_role}. "
                    f"Next step: Check the Courses tab to browse all verified learning resources."
                )
        # 6. Assessments / Diagnostics
        elif any(w in msg_lower for w in ["assessment", "test", "quiz", "diagnostic", "baseline"]):
            if assessments:
                last_asm = assessments[0]
                response = (
                    f"You recently completed '{last_asm.get('assessment_title', 'Assessment')}' with a score of {last_asm.get('score', 0):.0f}%. "
                    f"Our diagnostic assessments take approximately 15 minutes, feature real workplace scenarios, and include zero-penalty uncertainty options. "
                    f"Next step: Visit the Assessments tab to attempt your next pending competency diagnostic."
                )
            else:
                response = (
                    f"Diagnostic assessments help establish your baseline across key domains for {target_role}. "
                    f"They feature workplace scenarios with zero-penalty uncertainty options. "
                    f"Next step: Go to the Assessments Hub and start your first baseline assessment."
                )
        # 7. Greetings
        elif any(w in msg_lower for w in ["hi", "hello", "hey", "namaste", "greetings"]):
            response = (
                f"Namaste {emp_name}! I am Disha (दिशा), your learning guide on SkillStat AI. "
                f"How can I assist you today? You can ask me about your skill gaps, recommended courses, or your Skill Index."
            )
        # 8. General fallback
        else:
            response = (
                f"I am Disha, your AI competency advisor for your path toward {target_role}. "
                f"You can ask me questions like 'What are my top skill gaps?', 'What is my Skill Index?', "
                f"or 'Which course should I take first?'."
            )

        return {
            "response": response,
            "generated_by": "template_fallback"
        }



