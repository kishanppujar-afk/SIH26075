import pytest
from app.ai.fallback import (
    FallbackCompetencyAnalyzer,
    FallbackMCQGenerator,
    FallbackFeedbackGenerator
)


@pytest.mark.asyncio
async def test_fallback_competency_analyzer():
    analyzer = FallbackCompetencyAnalyzer()
    res = await analyzer.analyze_gap(
        skill_name="Docker & Container Orchestration",
        current_score=55,
        target_score=80,
        target_role="Senior Cloud Applications Engineer",
        department="Engineering & Digital Transformation"
    )
    assert res["generated_by"] == "template_fallback"
    assert res["gap"] == 25
    assert "Recommended because" in res["reason"]
    assert len(res["suggested_actions"]) > 0


@pytest.mark.asyncio
async def test_fallback_mcq_generator():
    generator = FallbackMCQGenerator()
    text = (
        "The National Quality Assurance Framework (NQAF) establishes clear guidelines for data collection. "
        "Official statistical microdata must be validated against predefined schema dictionaries. "
        "Sampling error metrics must be recorded alongside all published national survey estimates."
    )
    res = await generator.generate_mcqs(text=text, topic="NQAF & Data Quality", num_questions=3)
    assert res["generated_by"] == "template_fallback"
    assert len(res["questions"]) == 3
    for q in res["questions"]:
        assert len(q["options"]) == 4
        assert 0 <= q["correct_option_index"] < 4
        assert "explanation" in q


@pytest.mark.asyncio
async def test_fallback_feedback_generator():
    generator = FallbackFeedbackGenerator()
    evals = [
        {"is_correct": True, "question_text": "Sample Q1"},
        {"is_correct": False, "question_text": "Sample Q2"},
    ]
    res = await generator.generate_feedback(quiz_title="Survey Design Diagnostic", score=50.0, question_evaluations=evals)
    assert res["generated_by"] == "template_fallback"
    assert "Survey Design Diagnostic" in res["feedback_text"]
    assert "50%" in res["feedback_text"]
