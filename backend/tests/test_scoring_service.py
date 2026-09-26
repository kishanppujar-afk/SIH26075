import pytest
from app.services.scoring_service import (
    derive_status,
    compute_baseline_level,
    evaluate_assessment_submission
)
from app.models.assessment import AssessmentQuestion, AssessmentOption


def test_derive_status():
    assert derive_status(95, target=85) == "Exceeds Target"
    assert derive_status(88, target=85) == "Proficient"
    assert derive_status(85, target=85) == "Proficient"
    assert derive_status(75, target=85) == "On Track"
    assert derive_status(60, target=85) == "Growth Opportunity"


def test_compute_baseline_level():
    assert "Exceeds Baseline" in compute_baseline_level(92.5)
    assert "Solid Foundation" in compute_baseline_level(82.0)
    assert "Developing Competency" in compute_baseline_level(68.0)
    assert "Foundational Explorer" in compute_baseline_level(45.0)


def test_evaluate_assessment_submission():
    # Construct mock questions
    q1 = AssessmentQuestion(
        id="q1",
        assessment_id="asm1",
        topic="Compute",
        competency="Cloud Architecture",
        scenario="Scenario 1",
        question_text="Question 1",
        correct_option_id="opt-correct",
        rationale="Clear rationale",
        growth_resource={"title": "Cloud Lab", "type": "Lab", "duration": "2h"}
    )
    opt1_correct = AssessmentOption(id="opt-correct", question_id="q1", text="Correct", is_correct=True, is_uncertainty_option=False)
    opt1_wrong = AssessmentOption(id="opt-wrong", question_id="q1", text="Wrong", is_correct=False, is_uncertainty_option=False)
    opt1_unsure = AssessmentOption(id="opt-unsure", question_id="q1", text="Unsure", is_correct=False, is_uncertainty_option=True)
    q1.options = [opt1_correct, opt1_wrong, opt1_unsure]

    q2 = AssessmentQuestion(
        id="q2",
        assessment_id="asm1",
        topic="Containers",
        competency="Docker & Kubernetes",
        scenario="Scenario 2",
        question_text="Question 2",
        correct_option_id="opt2-correct",
        rationale="Docker rationale",
        growth_resource={"title": "Docker Course", "type": "Course", "duration": "4h"}
    )
    opt2_correct = AssessmentOption(id="opt2-correct", question_id="q2", text="Correct", is_correct=True, is_uncertainty_option=False)
    opt2_wrong = AssessmentOption(id="opt2-wrong", question_id="q2", text="Wrong", is_correct=False, is_uncertainty_option=False)
    opt2_unsure = AssessmentOption(id="opt2-unsure", question_id="q2", text="Unsure", is_correct=False, is_uncertainty_option=True)
    q2.options = [opt2_correct, opt2_wrong, opt2_unsure]

    # Test 1: q1 correct (100), q2 unsure (60) -> overall 80.0
    result = evaluate_assessment_submission([q1, q2], {"q1": "opt-correct", "q2": "opt2-unsure"})
    assert result["overallScore"] == 80.0
    assert len(result["confidentCorrect"]) == 1
    assert result["confidentCorrect"][0]["id"] == "q1"
    assert len(result["growthOpportunities"]) == 1
    assert result["growthOpportunities"][0]["id"] == "q2"
    assert result["growthOpportunities"][0]["isUncertain"] is True
    assert result["growthOpportunities"][0]["growthResource"]["title"] == "Docker Course"

    # Test 2: q1 wrong (30), q2 wrong (30) -> overall 30.0
    result_wrong = evaluate_assessment_submission([q1, q2], {"q1": "opt-wrong", "q2": "opt2-wrong"})
    assert result_wrong["overallScore"] == 30.0
    assert len(result_wrong["confidentCorrect"]) == 0
    assert len(result_wrong["growthOpportunities"]) == 2
