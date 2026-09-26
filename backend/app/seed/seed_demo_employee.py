"""Seed Script: Demo Employee Aarav Sharma (EMP-2048)

Seeds the primary demo official matching mockEmployee, mockSkills,
mockRecommendations, and mockAiInsights from src/mock/employeeData.js.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.employee import Employee
from app.models.competency import EmployeeSkillScore, CompetencyScoreHistory
from app.models.learning_resource import Recommendation
from app.models.ai_insight import AiInsight

DEMO_EMPLOYEE_ID = "EMP-2048"


def seed_demo_employee(db: Session) -> None:
    # 1. Create or update Employee
    emp = db.query(Employee).filter(Employee.id == DEMO_EMPLOYEE_ID).first()
    if not emp:
        emp = Employee(
            id=DEMO_EMPLOYEE_ID,
            name="Aarav Sharma",
            email="aarav.sharma@mospi.gov.in",
            hashed_password=get_password_hash("password123"),
            designation="Junior Systems Specialist / Assistant Director (ISS)",
            role_title="Junior Full Stack Developer",
            target_role="Senior Cloud Applications Engineer",
            department="Engineering & Digital Transformation",
            education="B.Tech Computer Science & Statistics",
            experience_years=3.5,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            readiness_score=78,
            skill_index=82,
            completed_courses_count=14,
            pending_assessments_count=2,
            weekly_goal_hours=6.0,
            weekly_hours_logged=4.5,
            is_admin=True
        )
        db.add(emp)
        db.commit()

    # 2. Seed Employee Skill Scores (s1..s6)
    skill_scores = [
        {"skill_id": "s1", "current_score": 85, "target_score": 90, "status": "Proficient", "trending": "up"},
        {"skill_id": "s2", "current_score": 62, "target_score": 85, "status": "Growth Opportunity", "trending": "up"},
        {"skill_id": "s3", "current_score": 76, "target_score": 80, "status": "On Track", "trending": "neutral"},
        {"skill_id": "s4", "current_score": 55, "target_score": 80, "status": "Growth Opportunity", "trending": "up"},
        {"skill_id": "s5", "current_score": 68, "target_score": 85, "status": "On Track", "trending": "up"},
        {"skill_id": "s6", "current_score": 92, "target_score": 85, "status": "Exceeds Target", "trending": "neutral"},
    ]

    for item in skill_scores:
        existing = db.query(EmployeeSkillScore).filter(
            EmployeeSkillScore.employee_id == DEMO_EMPLOYEE_ID,
            EmployeeSkillScore.skill_id == item["skill_id"]
        ).first()
        if not existing:
            db.add(EmployeeSkillScore(
                employee_id=DEMO_EMPLOYEE_ID,
                skill_id=item["skill_id"],
                current_score=item["current_score"],
                target_score=item["target_score"],
                status=item["status"],
                trending=item["trending"],
                last_assessed_at=datetime.now(timezone.utc)
            ))

    # 3. Seed historical progress data points for Growth Tree
    now = datetime.now(timezone.utc)
    history_points = [
        {"skill_id": "s1", "score": 70, "days_ago": 28},
        {"skill_id": "s1", "score": 80, "days_ago": 14},
        {"skill_id": "s1", "score": 85, "days_ago": 2},
        {"skill_id": "s2", "score": 50, "days_ago": 28},
        {"skill_id": "s2", "score": 62, "days_ago": 5},
        {"skill_id": "s4", "score": 45, "days_ago": 21},
        {"skill_id": "s4", "score": 55, "days_ago": 3},
    ]
    for hp in history_points:
        db.add(CompetencyScoreHistory(
            employee_id=DEMO_EMPLOYEE_ID,
            skill_id=hp["skill_id"],
            score=hp["score"],
            source="seed",
            recorded_at=now - timedelta(days=hp["days_ago"])
        ))

    # 4. Seed Recommendations (rec1..rec3)
    recommendations = [
        {
            "id": "rec1",
            "title": "Accelerate Docker & Kubernetes Deployment",
            "type": "Course",
            "provider": "SkillStat Academy",
            "duration": "4.5 hrs",
            "impact_skill": "Docker & Container Orchestration",
            "match_score": 96,
            "reason": "Recommended because your Docker & Container Orchestration assessment result is 25 points below the required level for Senior Cloud Applications Engineer.",
            "is_urgent": True
        },
        {
            "id": "rec2",
            "title": "Designing Resilient Cloud Architecture with AWS",
            "type": "Hands-on Lab",
            "provider": "CloudForge Labs",
            "duration": "6.0 hrs",
            "impact_skill": "Cloud Architecture (AWS/GCP)",
            "match_score": 92,
            "reason": "Recommended because your Cloud Architecture (AWS/GCP) score has a 23-point delta from the benchmark.",
            "is_urgent": True
        },
        {
            "id": "rec3",
            "title": "Advanced Microservices Communication & Messaging",
            "type": "Workshop",
            "provider": "SkillStat Internal",
            "duration": "3.0 hrs",
            "impact_skill": "Node.js & Microservices",
            "match_score": 84,
            "reason": "Recommended to consolidate asynchronous patterns and reach target mastery.",
            "is_urgent": False
        }
    ]

    for rec in recommendations:
        existing = db.query(Recommendation).filter(Recommendation.id == rec["id"]).first()
        if not existing:
            db.add(Recommendation(
                id=rec["id"],
                employee_id=DEMO_EMPLOYEE_ID,
                title=rec["title"],
                type=rec["type"],
                provider=rec["provider"],
                duration=rec["duration"],
                impact_skill=rec["impact_skill"],
                match_score=rec["match_score"],
                reason=rec["reason"],
                is_urgent=rec["is_urgent"]
            ))

    # 5. Seed AI Insights (ins1, ins2)
    insights = [
        {
            "id": "ins1",
            "type": "Opportunity",
            "text": "You are only 13 points away from matching the benchmark for Senior Cloud Applications Engineer. Completing Docker & Container Orchestration will bridge 60% of this gap."
        },
        {
            "id": "ins2",
            "type": "Streak",
            "text": "Consistent learner! You have logged 4 consecutive weeks of continuous skill development."
        }
    ]

    for ins in insights:
        existing = db.query(AiInsight).filter(AiInsight.id == ins["id"]).first()
        if not existing:
            db.add(AiInsight(
                id=ins["id"],
                employee_id=DEMO_EMPLOYEE_ID,
                type=ins["type"],
                text=ins["text"]
            ))

    db.commit()
