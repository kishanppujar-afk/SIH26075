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

        topic_label = topic or "Official Statistics & Technical Competency"
        questions = []

        for i in range(min(num_questions, max(1, len(sentences)))):
            seed_sentence = sentences[i % len(sentences)] if sentences else "Official statistical systems require robust data validation, metadata standards, and sampling integrity."
            words = [w for w in re.findall(r'\b[A-Za-z]{4,}\b', seed_sentence)]
            key_term = words[0] if words else "Methodology"

            q_item = {
                "question_text": f"According to the training material on {topic_label}, which of the following statements best reflects standard practice regarding {key_term}?",
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
