"""Assessment Scoring Service

Faithfully reproduces the diagnostic assessment scoring and capability grouping
previously executed client-side in AssessmentsView.jsx and AssessmentResults.jsx:
- Full credit for confident correct answers
- Partial diagnostic credit for the 'uncertainty' option (zero-penalty exploratory design)
- Baseline credit for incorrect answers
- Aggregate per-competency capability list with status derivation
- Separation into confidentCorrect vs growthOpportunities with attached learning resources
"""
from typing import List, Dict, Any, Tuple
from app.models.assessment import AssessmentQuestion, AssessmentOption


def derive_status(score: int, target: int = 85) -> str:
    """Derives competency status according to SkillStat UI thresholds."""
    if score >= target + 5:
        return "Exceeds Target"
    elif score >= target:
        return "Proficient"
    elif score >= target - 12:
        return "On Track"
    else:
        return "Growth Opportunity"


def compute_baseline_level(overall_score: float) -> str:
    """Computes narrative baseline tier matching UI badges."""
    if overall_score >= 90:
        return f"Exceeds Baseline ({int(overall_score)}%)"
    elif overall_score >= 75:
        return f"Solid Foundation ({int(overall_score)}%)"
    elif overall_score >= 60:
        return f"Developing Competency ({int(overall_score)}%)"
    else:
        return f"Foundational Explorer ({int(overall_score)}%)"


def evaluate_assessment_submission(
    questions: List[AssessmentQuestion],
    answers_map: Dict[str, str]  # question_id -> selected_option_id
) -> Dict[str, Any]:
    """
    Evaluates submitted answers for diagnostic assessment.

    Args:
        questions: List of AssessmentQuestion objects with options.
        answers_map: Map of question_id to selected_option_id.

    Returns:
        Dict with overallScore, baselineLevel, capabilityList, confidentCorrect, growthOpportunities
    """
    competency_scores: Dict[str, List[float]] = {}
    confident_correct: List[Dict[str, Any]] = []
    growth_opportunities: List[Dict[str, Any]] = []

    total_points = 0.0
    evaluated_questions = 0

    for q in questions:
        selected_id = answers_map.get(q.id)
        # Find selected option
        selected_opt = next((opt for opt in q.options if opt.id == selected_id), None)
        
        is_correct = (selected_id == q.correct_option_id)
        is_uncertain = bool(selected_opt and selected_opt.is_uncertainty_option)

        # Scoring weight:
        # 100 for correct
        # 60 for uncertainty option (honesty rewarded in diagnostic baseline)
        # 30 for incorrect
        if is_correct:
            points = 100.0
        elif is_uncertain:
            points = 60.0
        else:
            points = 30.0

        total_points += points
        evaluated_questions += 1

        comp = q.competency
        if comp not in competency_scores:
            competency_scores[comp] = []
        competency_scores[comp].append(points)

        q_summary = {
            "id": q.id,
            "topic": q.topic,
            "competency": q.competency,
            "question": q.question_text,
            "rationale": q.rationale,
            "growthResource": q.growth_resource,
            "isUncertain": is_uncertain,
            "isCorrect": is_correct
        }

        if is_correct:
            confident_correct.append(q_summary)
        else:
            growth_opportunities.append(q_summary)

    overall_score = round(total_points / max(1, evaluated_questions), 1)

    # Capability list grouped by competency
    capability_list = []
    for comp_name, scores in competency_scores.items():
        comp_avg = int(round(sum(scores) / len(scores)))
        target = 85
        status = derive_status(comp_avg, target)
        capability_list.append({
            "name": comp_name,
            "score": comp_avg,
            "target": target,
            "status": status
        })

    return {
        "overallScore": overall_score,
        "baselineLevel": compute_baseline_level(overall_score),
        "capabilityList": capability_list,
        "confidentCorrect": confident_correct,
        "growthOpportunities": growth_opportunities
    }
