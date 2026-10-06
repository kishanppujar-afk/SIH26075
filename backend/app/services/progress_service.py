"""Progress and Growth Tree Tracking Service

Tracks historical score trajectory, computes role readiness metrics, and
reproduces the 4-stage narrative growth tree model from utils/growthStage.js.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.competency import CompetencyScoreHistory, EmployeeSkillScore, Skill
from app.models.employee import Employee


def get_growth_stage_info(score: int) -> Dict[str, Any]:
    """
    Direct server-side implementation of utils/growthStage.js getStageInfo(score).
    """
    if score < 25:
        return {
            "key": "seed",
            "stageIndex": 0,
            "name": "Seed & Sprout",
            "subVariant": "sprout",
            "badge": "Sprout 🌱",
            "narrative": "Every journey starts with a single seed. You're just getting started.",
            "accentClass": "text-sage-700 bg-sage-50 border-sage-200",
            "readinessScore": score,
            "blossomPercentage": int((score / 25.0) * 25)
        }
    if score < 50:
        return {
            "key": "sapling",
            "stageIndex": 1,
            "name": "Young Sapling",
            "subVariant": "sapling",
            "badge": "Sapling 🌿",
            "narrative": "Your foundation is taking root.",
            "accentClass": "text-emerald-700 bg-emerald-50 border-emerald-200",
            "readinessScore": score,
            "blossomPercentage": int(25 + ((score - 25) / 25.0) * 25)
        }
    if score < 75:
        return {
            "key": "young-tree",
            "stageIndex": 2,
            "name": "Young Tree",
            "subVariant": "young-tree",
            "badge": "Young Tree 🌳",
            "narrative": "Strong growth — your skills are branching out.",
            "accentClass": "text-teal-700 bg-teal-50 border-teal-200",
            "readinessScore": score,
            "blossomPercentage": int(50 + ((score - 50) / 25.0) * 25)
        }

    sub_variant = "bloom-early"
    badge = "Early Bloom 🌸"
    narrative = "Your expertise is beginning to blossom."
    name = "Blossoming Tree"

    if score >= 95:
        sub_variant = "bloom-peak"
        badge = "Peak Bloom 🌺"
        narrative = "Your expertise is in full, radiant bloom."
        name = "Blossoming Tree — Peak"
    elif score >= 85:
        sub_variant = "bloom-vibrant"
        badge = "Vibrant Bloom 🌸"
        narrative = "Your skills are in flourishing bloom."
        name = "Blossoming Tree — Full"

    return {
        "key": f"blossom-{sub_variant}",
        "stageIndex": 3,
        "name": name,
        "subVariant": sub_variant,
        "badge": badge,
        "narrative": narrative,
        "accentClass": "text-rose-700 bg-rose-50 border-rose-200",
        "readinessScore": score,
        "blossomPercentage": int(75 + ((score - 75) / 25.0) * 25)
    }


def record_competency_score(
    db: Session,
    employee_id: str,
    skill_id: str,
    new_score: int,
    source: str = "assessment",
    attempt_id: Optional[str] = None
) -> CompetencyScoreHistory:
    """Records a point in the competency history trajectory and updates current score."""
    history_entry = CompetencyScoreHistory(
        employee_id=employee_id,
        skill_id=skill_id,
        score=new_score,
        source=source,
        assessment_attempt_id=attempt_id,
        recorded_at=datetime.now(timezone.utc)
    )
    db.add(history_entry)

    # Update or insert EmployeeSkillScore
    existing = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == employee_id,
        EmployeeSkillScore.skill_id == skill_id
    ).first()

    if existing:
        previous_score = existing.current_score
        existing.current_score = new_score
        existing.trending = "up" if new_score > previous_score else ("down" if new_score < previous_score else "neutral")
        target = existing.target_score or 85
        if new_score >= target + 5:
            existing.status = "Exceeds Target"
        elif new_score >= target:
            existing.status = "Proficient"
        elif new_score >= target - 12:
            existing.status = "On Track"
        else:
            existing.status = "Growth Opportunity"
        existing.last_assessed_at = datetime.now(timezone.utc)
    else:
        # Cap initial score for a brand new skill at max 80 to prevent a fresh skill
        # from entering at 100 and immediately diluting the readiness denominator.
        initial_score = min(new_score, 80)
        new_skill_score = EmployeeSkillScore(
            employee_id=employee_id,
            skill_id=skill_id,
            current_score=initial_score,
            target_score=85,
            status="Proficient" if initial_score >= 85 else "Growth Opportunity",
            trending="up",
            last_assessed_at=datetime.now(timezone.utc)
        )
        db.add(new_skill_score)

    # Recalculate employee readiness_score & skill_index
    all_scores = db.query(EmployeeSkillScore).filter(EmployeeSkillScore.employee_id == employee_id).all()
    if all_scores:
        avg_score = int(sum(s.current_score for s in all_scores) / len(all_scores))
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            employee.skill_index = avg_score
            # Readiness score incorporates completion and target alignment
            target_ratio = sum(min(1.0, s.current_score / max(1, s.target_score)) for s in all_scores) / len(all_scores)
            employee.readiness_score = int(target_ratio * 100)

    db.commit()
    return history_entry
