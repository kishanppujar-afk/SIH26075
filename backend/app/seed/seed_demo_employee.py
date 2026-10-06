"""Seed Script: Multi-User Organization, Departments, Managers, and Employees

Seeds:
1. 4 Official MoSPI Departments:
   - Labour Statistics
   - Price Statistics
   - National Accounts
   - Survey Design
2. 1 Central Admin account (ADM-001)
3. 3 Department Manager accounts (MGR-101, MGR-102, MGR-103)
4. Primary Demo Employee EMP-2048 (Aarav Sharma) with full assessment/progress state
5. 7 Additional Employee accounts (EMP-2049..EMP-2056) with distinct skill profiles, gaps, and metrics
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.department import Department
from app.models.employee import Employee
from app.models.competency import EmployeeSkillScore, CompetencyScoreHistory
from app.models.learning_resource import Recommendation
from app.models.ai_insight import AiInsight


DEMO_EMPLOYEE_ID = "EMP-2048"


def seed_departments(db: Session) -> None:
    """Ensures the 4 official departments exist in DB."""
    depts = [
        {"id": "labour-statistics", "name": "Labour Statistics"},
        {"id": "price-statistics", "name": "Price Statistics"},
        {"id": "national-accounts", "name": "National Accounts"},
        {"id": "survey-design", "name": "Survey Design"},
    ]
    for d in depts:
        existing = db.query(Department).filter(Department.id == d["id"]).first()
        if not existing:
            db.add(Department(id=d["id"], name=d["name"]))
    db.commit()


def seed_demo_employee(db: Session) -> None:
    # 0. Ensure departments exist
    seed_departments(db)

    # Track accounts for credential printout at end
    seeded_credentials = []

    # 1. Seed / Update 1 Admin Account
    admin_id = "ADM-001"
    admin = db.query(Employee).filter(Employee.id == admin_id).first()
    if not admin:
        admin = Employee(
            id=admin_id,
            name="Rajesh Varma",
            email="admin@mospi.gov.in",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            designation="Chief Statistical Administrator / Joint Secretary",
            role_title="Central System Administrator",
            target_role="Director General (Statistics)",
            department="Central Administration",
            department_id=None,
            manager_id=None,
            education="M.Stat (ISI Kolkata) & Master of Public Administration",
            experience_years=18.0,
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            readiness_score=95,
            skill_index=94,
            completed_courses_count=28,
            pending_assessments_count=0,
            weekly_goal_hours=4.0,
            weekly_hours_logged=4.0,
            is_admin=True,
        )
        db.add(admin)
        db.commit()
    else:
        admin.role = "admin"
        admin.is_admin = True
        admin.hashed_password = get_password_hash("AdminPass123!")
        db.commit()
    seeded_credentials.append({
        "id": admin_id,
        "name": "Rajesh Varma",
        "email": "admin@mospi.gov.in",
        "password": "AdminPass123!",
        "role": "admin",
        "department": "None (Central)",
        "manager": "None"
    })

    # 2. Seed 3 Manager Accounts (Labour Statistics, Price Statistics, National Accounts)
    managers_data = [
        {
            "id": "MGR-101",
            "name": "Pooja Sengupta",
            "email": "pooja.sengupta@mospi.gov.in",
            "password": "ManagerPass123!",
            "department_id": "labour-statistics",
            "department": "Labour Statistics",
            "designation": "Director (Labour Statistics Division)",
            "role_title": "Division Director",
            "target_role": "Deputy Director General (Labour & Employment)",
            "experience_years": 14.0,
            "readiness_score": 88,
            "skill_index": 86,
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            "scores": [
                {"skill_id": "skill-leadership", "score": 88, "target": 90},
                {"skill_id": "skill-labour-stats", "score": 92, "target": 90},
                {"skill_id": "skill-ethics", "score": 85, "target": 85},
                {"skill_id": "skill-sampling", "score": 80, "target": 85},
            ]
        },
        {
            "id": "MGR-102",
            "name": "Suresh Raman",
            "email": "suresh.raman@mospi.gov.in",
            "password": "ManagerPass123!",
            "department_id": "price-statistics",
            "department": "Price Statistics",
            "designation": "Director (Price Statistics Division)",
            "role_title": "Division Director",
            "target_role": "Deputy Director General (Economic Statistics)",
            "experience_years": 15.5,
            "readiness_score": 87,
            "skill_index": 85,
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "scores": [
                {"skill_id": "skill-leadership", "score": 85, "target": 90},
                {"skill_id": "skill-price-stats", "score": 94, "target": 90},
                {"skill_id": "skill-ethics", "score": 88, "target": 85},
                {"skill_id": "skill-data-quality", "score": 84, "target": 85},
            ]
        },
        {
            "id": "MGR-103",
            "name": "Kavita Deshmukh",
            "email": "kavita.deshmukh@mospi.gov.in",
            "password": "ManagerPass123!",
            "department_id": "national-accounts",
            "department": "National Accounts",
            "designation": "Director (National Accounts Division / CSO)",
            "role_title": "Division Director",
            "target_role": "Deputy Director General (National Accounts)",
            "experience_years": 16.0,
            "readiness_score": 91,
            "skill_index": 89,
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            "scores": [
                {"skill_id": "skill-leadership", "score": 89, "target": 90},
                {"skill_id": "skill-national-accounts", "score": 96, "target": 90},
                {"skill_id": "skill-ethics", "score": 90, "target": 85},
                {"skill_id": "skill-r", "score": 82, "target": 85},
            ]
        },
    ]

    for mgr in managers_data:
        m_emp = db.query(Employee).filter(Employee.id == mgr["id"]).first()
        if not m_emp:
            m_emp = Employee(
                id=mgr["id"],
                name=mgr["name"],
                email=mgr["email"],
                hashed_password=get_password_hash(mgr["password"]),
                role="manager",
                designation=mgr["designation"],
                role_title=mgr["role_title"],
                target_role=mgr["target_role"],
                department=mgr["department"],
                department_id=mgr["department_id"],
                manager_id=None,
                education="M.Sc Statistics / ISS Cadre",
                experience_years=mgr["experience_years"],
                avatar_url=mgr["avatar_url"],
                readiness_score=mgr["readiness_score"],
                skill_index=mgr["skill_index"],
                completed_courses_count=20,
                pending_assessments_count=1,
                weekly_goal_hours=5.0,
                weekly_hours_logged=5.0,
                is_admin=False,
            )
            db.add(m_emp)
            db.commit()
        else:
            m_emp.role = "manager"
            m_emp.department_id = mgr["department_id"]
            m_emp.department = mgr["department"]
            m_emp.hashed_password = get_password_hash(mgr["password"])
            db.commit()

        # Seed manager skill scores
        db.query(EmployeeSkillScore).filter(EmployeeSkillScore.employee_id == mgr["id"]).delete()
        for sk in mgr["scores"]:
            db.add(EmployeeSkillScore(
                employee_id=mgr["id"],
                skill_id=sk["skill_id"],
                current_score=sk["score"],
                target_score=sk["target"],
                status="Exceeds Target" if sk["score"] >= sk["target"] else "Proficient",
                trending="up",
                last_assessed_at=datetime.now(timezone.utc)
            ))
        db.commit()

        seeded_credentials.append({
            "id": mgr["id"],
            "name": mgr["name"],
            "email": mgr["email"],
            "password": mgr["password"],
            "role": "manager",
            "department": mgr["department"],
            "manager": "None (Division Head)"
        })

    # 3. Seed / Update Primary Demo Employee EMP-2048 (Aarav Sharma)
    emp = db.query(Employee).filter(Employee.id == DEMO_EMPLOYEE_ID).first()
    if not emp:
        emp = Employee(
            id=DEMO_EMPLOYEE_ID,
            name="Aarav Sharma",
            email="aarav.sharma@mospi.gov.in",
            hashed_password=get_password_hash("password123"),
            role="employee",
            designation="Junior Systems Specialist / Assistant Director (ISS)",
            role_title="Junior Full Stack Developer",
            target_role="Senior Cloud Applications Engineer",
            department="Labour Statistics",
            department_id="labour-statistics",
            manager_id="MGR-101",
            education="B.Tech Computer Science & Statistics",
            experience_years=3.5,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            readiness_score=80,
            skill_index=70,
            completed_courses_count=14,
            pending_assessments_count=2,
            weekly_goal_hours=6.0,
            weekly_hours_logged=4.5,
            is_admin=True,
        )
        db.add(emp)
        db.commit()
    else:
        emp.role = "employee"
        emp.department_id = "labour-statistics"
        emp.department = "Labour Statistics"
        emp.manager_id = "MGR-101"
        emp.hashed_password = get_password_hash("password123")
        emp.readiness_score = 80
        emp.skill_index = 70
        db.commit()

    # Reset & reseed EMP-2048 skill scores
    db.query(EmployeeSkillScore).filter(EmployeeSkillScore.employee_id == DEMO_EMPLOYEE_ID).delete()
    aarav_skills = [
        {"skill_id": "skill-sampling", "current_score": 48, "target_score": 85, "status": "Growth Opportunity", "trending": "up"},
        {"skill_id": "skill-price-stats", "current_score": 58, "target_score": 85, "status": "Growth Opportunity", "trending": "neutral"},
        {"skill_id": "skill-national-accounts", "current_score": 66, "target_score": 85, "status": "Growth Opportunity", "trending": "up"},
        {"skill_id": "skill-sdg-indicators", "current_score": 74, "target_score": 85, "status": "On Track", "trending": "up"},
        {"skill_id": "s1", "current_score": 85, "target_score": 90, "status": "Proficient", "trending": "up"},
        {"skill_id": "s6", "current_score": 92, "target_score": 85, "status": "Exceeds Target", "trending": "neutral"},
        {"skill_id": "skill-dpi", "current_score": 70, "target_score": 80, "status": "On Track", "trending": "up"},
    ]
    for item in aarav_skills:
        db.add(EmployeeSkillScore(
            employee_id=DEMO_EMPLOYEE_ID,
            skill_id=item["skill_id"],
            current_score=item["current_score"],
            target_score=item["target_score"],
            status=item["status"],
            trending=item["trending"],
            last_assessed_at=datetime.now(timezone.utc)
        ))

    # EMP-2048 History
    db.query(CompetencyScoreHistory).filter(CompetencyScoreHistory.employee_id == DEMO_EMPLOYEE_ID).delete()
    now = datetime.now(timezone.utc)
    for hp in [
        {"skill_id": "skill-sampling", "score": 35, "days_ago": 28},
        {"skill_id": "skill-sampling", "score": 42, "days_ago": 14},
        {"skill_id": "skill-sampling", "score": 48, "days_ago": 2},
        {"skill_id": "skill-price-stats", "score": 45, "days_ago": 21},
        {"skill_id": "skill-price-stats", "score": 58, "days_ago": 2},
        {"skill_id": "skill-national-accounts", "score": 55, "days_ago": 28},
        {"skill_id": "skill-national-accounts", "score": 66, "days_ago": 5},
        {"skill_id": "s1", "score": 80, "days_ago": 14},
        {"skill_id": "s1", "score": 85, "days_ago": 2},
    ]:
        db.add(CompetencyScoreHistory(
            employee_id=DEMO_EMPLOYEE_ID,
            skill_id=hp["skill_id"],
            score=hp["score"],
            source="seed",
            recorded_at=now - timedelta(days=hp["days_ago"])
        ))

    # EMP-2048 Recommendations
    db.query(Recommendation).filter(Recommendation.employee_id == DEMO_EMPLOYEE_ID).delete()
    for rec in [
        {
            "id": "rec1",
            "title": "Advanced Sampling Methods & Survey Design Workshop",
            "type": "Workshop",
            "provider": "NSSTA Greater Noida",
            "duration": "5 Days (Intensive)",
            "impact_skill": "Sampling Techniques",
            "match_score": 96,
            "reason": "Recommended because your Sampling Techniques assessment score is 37 points below the required baseline for Senior Statistical Officer.",
            "is_urgent": True
        },
        {
            "id": "rec2",
            "title": "Consumer Price Index (CPI) Compilation & Practical Index Construction",
            "type": "Course",
            "provider": "MoSPI Training Division",
            "duration": "6.0 hrs",
            "impact_skill": "Price Statistics & Index Numbers",
            "match_score": 92,
            "reason": "Recommended because your Price Statistics score has a 27-point delta from the benchmark.",
            "is_urgent": True
        },
        {
            "id": "rec3",
            "title": "National Accounts Statistics (NAS) & GVA Macroeconomic Aggregates",
            "type": "Course",
            "provider": "NSSTA / CSO",
            "duration": "8.0 hrs",
            "impact_skill": "National Accounts & GDP",
            "match_score": 88,
            "reason": "Recommended to master Gross Value Added (GVA) compilation and advance toward target benchmark.",
            "is_urgent": False
        }
    ]:
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

    # EMP-2048 Insights
    db.query(AiInsight).filter(AiInsight.employee_id == DEMO_EMPLOYEE_ID).delete()
    for ins in [
        {"id": "ins1", "type": "Opportunity", "text": "Your highest-yield growth area is Sampling Techniques (37-point delta). Completing the NSSTA Advanced Sampling Workshop will bridge 60% of your competency gap."},
        {"id": "ins2", "type": "Streak", "text": "Consistent learner! You have logged 4 consecutive weeks of continuous skill development."}
    ]:
        db.add(AiInsight(id=ins["id"], employee_id=DEMO_EMPLOYEE_ID, type=ins["type"], text=ins["text"]))

    db.commit()

    seeded_credentials.append({
        "id": DEMO_EMPLOYEE_ID,
        "name": "Aarav Sharma",
        "email": "aarav.sharma@mospi.gov.in",
        "password": "password123",
        "role": "employee",
        "department": "Labour Statistics",
        "manager": "MGR-101 (Pooja Sengupta)"
    })

    # 4. Seed 7 Additional Employee Accounts Across All 4 Departments
    # GENUINELY DIFFERENT skill scores and gaps per employee!
    additional_employees = [
        # --- Labour Statistics (Under MGR-101) ---
        {
            "id": "EMP-2049",
            "name": "Ananya Rao",
            "email": "ananya.rao@mospi.gov.in",
            "password": "Password123!",
            "department_id": "labour-statistics",
            "department": "Labour Statistics",
            "manager_id": "MGR-101",
            "designation": "Statistical Investigator Gr. I",
            "role_title": "Labour Market Analyst",
            "target_role": "Senior Labour Economist",
            "education": "M.Sc Applied Statistics (Delhi University)",
            "experience_years": 4.0,
            "readiness_score": 72,
            "skill_index": 68,
            "completed_courses_count": 8,
            "pending_assessments_count": 3,
            "weekly_goal_hours": 5.0,
            "weekly_hours_logged": 3.5,
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Strong in Labour Stats & Survey Design; Weak in Python & SQL
            "skills": [
                {"skill_id": "skill-labour-stats", "score": 84, "target": 85, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-survey-design", "score": 80, "target": 85, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-sampling", "score": 62, "target": 85, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-python", "score": 42, "target": 80, "status": "Growth Opportunity", "trending": "down"},
                {"skill_id": "skill-sql", "score": 38, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "s6", "score": 78, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-open-data", "score": 65, "target": 80, "status": "On Track", "trending": "up"},
            ],
            "recommendation": {
                "id": "rec-2049",
                "title": "Python for Data Analysis & Statistical Modeling",
                "type": "Course",
                "provider": "MoSPI Digital Learning",
                "duration": "12 hrs",
                "impact_skill": "Python for Data Science",
                "match_score": 95,
                "reason": "Critical 38-point deficit in automated data pipelines for PLFS surveys.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2049",
                "type": "Opportunity",
                "text": "Prioritize computational data skills (Python/SQL) to complement your exceptional labour survey domain knowledge."
            }
        },
        {
            "id": "EMP-2050",
            "name": "Rohan Mehta",
            "email": "rohan.mehta@mospi.gov.in",
            "password": "Password123!",
            "department_id": "labour-statistics",
            "department": "Labour Statistics",
            "manager_id": "MGR-101",
            "designation": "Junior Statistical Officer",
            "role_title": "Field Survey & Employment Data Officer",
            "target_role": "Assistant Director (Labour Statistics)",
            "education": "B.Sc Statistics & Economics (St. Xavier's)",
            "experience_years": 2.2,
            "readiness_score": 64,
            "skill_index": 62,
            "completed_courses_count": 5,
            "pending_assessments_count": 4,
            "weekly_goal_hours": 6.0,
            "weekly_hours_logged": 5.0,
            "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Strong in Data Quality & Collaboration; Weak in Labour Analytics & Price Stats
            "skills": [
                {"skill_id": "skill-data-quality", "score": 76, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "s6", "score": 82, "target": 80, "status": "Proficient", "trending": "up"},
                {"skill_id": "skill-sampling", "score": 52, "target": 85, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-labour-stats", "score": 48, "target": 85, "status": "Growth Opportunity", "trending": "up"},
                {"skill_id": "skill-price-stats", "score": 35, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-ethics", "score": 75, "target": 80, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-sql", "score": 55, "target": 80, "status": "Growth Opportunity", "trending": "up"},
                {"skill_id": "skill-cybersecurity", "score": 60, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2050",
                "title": "Periodic Labour Force Survey (PLFS) Methodology Masterclass",
                "type": "Workshop",
                "provider": "NSSTA Greater Noida",
                "duration": "3 Days",
                "impact_skill": "Labour & Employment Statistics",
                "match_score": 93,
                "reason": "37-point delta in official employment indicator estimation.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2050",
                "type": "Goal",
                "text": "Targeting PLFS methodology will fast-track your progression to Assistant Director."
            }
        },

        # --- Price Statistics (Under MGR-102) ---
        {
            "id": "EMP-2051",
            "name": "Vikram Joshi",
            "email": "vikram.joshi@mospi.gov.in",
            "password": "Password123!",
            "department_id": "price-statistics",
            "department": "Price Statistics",
            "manager_id": "MGR-102",
            "designation": "Statistical Investigator Gr. II",
            "role_title": "Index Number Specialist",
            "target_role": "Senior Price Statistician",
            "education": "M.A. Econometrics (Madras School of Economics)",
            "experience_years": 4.8,
            "readiness_score": 83,
            "skill_index": 80,
            "completed_courses_count": 16,
            "pending_assessments_count": 1,
            "weekly_goal_hours": 5.0,
            "weekly_hours_logged": 6.0,
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Dominant in Price Stats & Index Numbers & Viz; Weak in Sampling & Cloud
            "skills": [
                {"skill_id": "skill-price-stats", "score": 91, "target": 85, "status": "Exceeds Target", "trending": "up"},
                {"skill_id": "skill-dataviz", "score": 84, "target": 85, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-python", "score": 65, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-sampling", "score": 45, "target": 85, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "s2", "score": 32, "target": 80, "status": "Growth Opportunity", "trending": "down"},
                {"skill_id": "skill-data-quality", "score": 82, "target": 85, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-ethics", "score": 80, "target": 85, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-dpi", "score": 68, "target": 80, "status": "On Track", "trending": "up"},
            ],
            "recommendation": {
                "id": "rec-2051",
                "title": "Probability Sampling for Consumer Price Collection Outlets",
                "type": "Course",
                "provider": "MoSPI Training Division",
                "duration": "8 hrs",
                "impact_skill": "Sampling Techniques",
                "match_score": 94,
                "reason": "Sub-sampling of retail shops requires rigorous probabilistic methods.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2051",
                "type": "Strength",
                "text": "Price index formulation is in the top 5% across the directorate; focus on sampling design to achieve holistic mastery."
            }
        },
        {
            "id": "EMP-2052",
            "name": "Meera Iyer",
            "email": "meera.iyer@mospi.gov.in",
            "password": "Password123!",
            "department_id": "price-statistics",
            "department": "Price Statistics",
            "manager_id": "MGR-102",
            "designation": "Assistant Statistical Officer",
            "role_title": "Inflation & CPI Analyst",
            "target_role": "Senior Economic Statistician",
            "education": "M.Sc Statistics (University of Mumbai)",
            "experience_years": 3.0,
            "readiness_score": 67,
            "skill_index": 65,
            "completed_courses_count": 9,
            "pending_assessments_count": 3,
            "weekly_goal_hours": 5.0,
            "weekly_hours_logged": 4.0,
            "avatar_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: High Python & SQL; Under-developed in Price Statistics Index aggregation
            "skills": [
                {"skill_id": "skill-python", "score": 78, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-sql", "score": 75, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-price-stats", "score": 46, "target": 85, "status": "Growth Opportunity", "trending": "up"},
                {"skill_id": "skill-sampling", "score": 58, "target": 85, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "s6", "score": 62, "target": 80, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-ethics", "score": 72, "target": 80, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-open-data", "score": 64, "target": 80, "status": "On Track", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2052",
                "title": "Laspeyres, Paasche & Hedonic Price Index Compilations",
                "type": "Course",
                "provider": "NSSTA / CSO",
                "duration": "10 hrs",
                "impact_skill": "Price Statistics & Index Numbers",
                "match_score": 96,
                "reason": "39-point gap in index formulas and substitution bias adjustment.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2052",
                "type": "Opportunity",
                "text": "Leverage your robust Python data skills to automate Laspeyres index chain weighting."
            }
        },

        # --- National Accounts (Under MGR-103) ---
        {
            "id": "EMP-2053",
            "name": "Divya Menon",
            "email": "divya.menon@mospi.gov.in",
            "password": "Password123!",
            "department_id": "national-accounts",
            "department": "National Accounts",
            "manager_id": "MGR-103",
            "designation": "Senior Statistical Officer",
            "role_title": "Macroeconomic Data Modeler",
            "target_role": "Deputy Director (National Accounts)",
            "education": "M.Phil Macroeconomics & Econometrics (JNU)",
            "experience_years": 6.5,
            "readiness_score": 86,
            "skill_index": 84,
            "completed_courses_count": 18,
            "pending_assessments_count": 1,
            "weekly_goal_hours": 6.0,
            "weekly_hours_logged": 6.5,
            "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Elite in National Accounts & R; Weak in Cloud & Cybersecurity
            "skills": [
                {"skill_id": "skill-national-accounts", "score": 93, "target": 90, "status": "Exceeds Target", "trending": "up"},
                {"skill_id": "skill-r", "score": 88, "target": 85, "status": "Exceeds Target", "trending": "up"},
                {"skill_id": "skill-data-quality", "score": 78, "target": 85, "status": "On Track", "trending": "neutral"},
                {"skill_id": "s2", "score": 38, "target": 80, "status": "Growth Opportunity", "trending": "down"},
                {"skill_id": "skill-cybersecurity", "score": 44, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-ethics", "score": 85, "target": 85, "status": "Proficient", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2053",
                "title": "Cloud Data Platforms & Security for Official Statistics",
                "type": "Course",
                "provider": "Digital India / NSSTA",
                "duration": "14 hrs",
                "impact_skill": "Cloud Architecture (AWS/GCP)",
                "match_score": 91,
                "reason": "National Accounts tabulation migration to secure NIC sovereign cloud.",
                "is_urgent": False,
            },
            "insight": {
                "id": "ins-2053",
                "type": "Streak",
                "text": "Consecutive 6-month domain benchmark leader in SNA 2008 compilation!"
            }
        },
        {
            "id": "EMP-2054",
            "name": "Karthik Reddy",
            "email": "karthik.reddy@mospi.gov.in",
            "password": "Password123!",
            "department_id": "national-accounts",
            "department": "National Accounts",
            "manager_id": "MGR-103",
            "designation": "Junior Statistical Officer",
            "role_title": "GVA & Sectoral Accounts Compiler",
            "target_role": "Senior Macroeconomic Analyst",
            "education": "B.Tech Computer Science & Statistics (IIT Hyderabad)",
            "experience_years": 2.5,
            "readiness_score": 61,
            "skill_index": 59,
            "completed_courses_count": 6,
            "pending_assessments_count": 4,
            "weekly_goal_hours": 6.0,
            "weekly_hours_logged": 4.5,
            "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Strong in SQL & Python; Low in National Accounts & Macro Concepts
            "skills": [
                {"skill_id": "skill-sql", "score": 82, "target": 80, "status": "Proficient", "trending": "up"},
                {"skill_id": "skill-python", "score": 74, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-national-accounts", "score": 39, "target": 85, "status": "Growth Opportunity", "trending": "up"},
                {"skill_id": "skill-price-stats", "score": 42, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-data-quality", "score": 60, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "s6", "score": 70, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-dpi", "score": 55, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2054",
                "title": "System of National Accounts (SNA 2008) Fundamentals",
                "type": "Course",
                "provider": "IMF / NSSTA Online",
                "duration": "16 hrs",
                "impact_skill": "National Accounts & GDP",
                "match_score": 97,
                "reason": "46-point gap in Gross Value Added (GVA) deflator mechanisms.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2054",
                "type": "Opportunity",
                "text": "Complete the SNA 2008 fundamentals module to elevate your database queries to macroeconomic domain insights."
            }
        },

        # --- Survey Design (Specialist Division) ---
        {
            "id": "EMP-2055",
            "name": "Tanya Sharma",
            "email": "tanya.sharma@mospi.gov.in",
            "password": "Password123!",
            "department_id": "survey-design",
            "department": "Survey Design",
            "manager_id": None,
            "designation": "Senior Survey Methodologist",
            "role_title": "Lead Sampling Statistician",
            "target_role": "Joint Director (Survey Methodology)",
            "education": "Ph.D Sampling Theory (ISI Kolkata)",
            "experience_years": 8.0,
            "readiness_score": 89,
            "skill_index": 87,
            "completed_courses_count": 22,
            "pending_assessments_count": 1,
            "weekly_goal_hours": 4.0,
            "weekly_hours_logged": 4.5,
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: Elite in Sampling & Survey Design; Low in National Accounts & Price Stats
            "skills": [
                {"skill_id": "skill-sampling", "score": 95, "target": 90, "status": "Exceeds Target", "trending": "up"},
                {"skill_id": "skill-survey-design", "score": 92, "target": 90, "status": "Exceeds Target", "trending": "up"},
                {"skill_id": "skill-python", "score": 64, "target": 80, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-national-accounts", "score": 40, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "skill-price-stats", "score": 38, "target": 80, "status": "Growth Opportunity", "trending": "down"},
                {"skill_id": "skill-leadership", "score": 81, "target": 85, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-open-data", "score": 62, "target": 80, "status": "On Track", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2055",
                "title": "Computer-Assisted Personal Interviewing (CAPI) Architecture",
                "type": "Workshop",
                "provider": "UNSD / NSSTA",
                "duration": "4 Days",
                "impact_skill": "Survey Design",
                "match_score": 90,
                "reason": "Transitioning nationwide NSS surveys to fully digital tablet interfaces.",
                "is_urgent": False,
            },
            "insight": {
                "id": "ins-2055",
                "type": "Strength",
                "text": "Recognized subject matter expert in Multi-stage Stratified Sampling nationwide."
            }
        },
        {
            "id": "EMP-2056",
            "name": "Ishaan Verma",
            "email": "ishaan.verma@mospi.gov.in",
            "password": "Password123!",
            "department_id": "survey-design",
            "department": "Survey Design",
            "manager_id": None,
            "designation": "Statistical Investigator Gr. II",
            "role_title": "Household Survey Field Specialist",
            "target_role": "Survey Field Coordinator",
            "education": "B.A. Statistics & Demography (BHU)",
            "experience_years": 3.2,
            "readiness_score": 70,
            "skill_index": 66,
            "completed_courses_count": 7,
            "pending_assessments_count": 2,
            "weekly_goal_hours": 5.0,
            "weekly_hours_logged": 4.0,
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
            # Distinct profile: High in Survey Design & Data Quality; Low in Sampling Theory & SQL
            "skills": [
                {"skill_id": "skill-survey-design", "score": 84, "target": 80, "status": "Proficient", "trending": "up"},
                {"skill_id": "skill-data-quality", "score": 80, "target": 80, "status": "Proficient", "trending": "neutral"},
                {"skill_id": "skill-sampling", "score": 45, "target": 85, "status": "Growth Opportunity", "trending": "up"},
                {"skill_id": "skill-sql", "score": 36, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
                {"skill_id": "s6", "score": 76, "target": 80, "status": "On Track", "trending": "up"},
                {"skill_id": "skill-ethics", "score": 74, "target": 80, "status": "On Track", "trending": "neutral"},
                {"skill_id": "skill-cybersecurity", "score": 50, "target": 80, "status": "Growth Opportunity", "trending": "neutral"},
            ],
            "recommendation": {
                "id": "rec-2056",
                "title": "Survey Weighting, Non-Response Calibration and Imputation",
                "type": "Course",
                "provider": "NSSTA Greater Noida",
                "duration": "8 hrs",
                "impact_skill": "Sampling Techniques",
                "match_score": 95,
                "reason": "40-point delta in handling rural and urban non-response adjustment.",
                "is_urgent": True,
            },
            "insight": {
                "id": "ins-2056",
                "type": "Opportunity",
                "text": "Mastering non-response weighting will advance your field survey coordination capabilities."
            }
        },
    ]

    for data in additional_employees:
        emp_obj = db.query(Employee).filter(Employee.id == data["id"]).first()
        if not emp_obj:
            emp_obj = Employee(
                id=data["id"],
                name=data["name"],
                email=data["email"],
                hashed_password=get_password_hash(data["password"]),
                role="employee",
                designation=data["designation"],
                role_title=data["role_title"],
                target_role=data["target_role"],
                department=data["department"],
                department_id=data["department_id"],
                manager_id=data["manager_id"],
                education=data["education"],
                experience_years=data["experience_years"],
                avatar_url=data["avatar_url"],
                readiness_score=data["readiness_score"],
                skill_index=data["skill_index"],
                completed_courses_count=data["completed_courses_count"],
                pending_assessments_count=data["pending_assessments_count"],
                weekly_goal_hours=data["weekly_goal_hours"],
                weekly_hours_logged=data["weekly_hours_logged"],
                is_admin=False,
            )
            db.add(emp_obj)
            db.commit()
        else:
            emp_obj.role = "employee"
            emp_obj.department_id = data["department_id"]
            emp_obj.department = data["department"]
            emp_obj.manager_id = data["manager_id"]
            emp_obj.hashed_password = get_password_hash(data["password"])
            emp_obj.readiness_score = data["readiness_score"]
            emp_obj.skill_index = data["skill_index"]
            db.commit()

        # Seed scores
        db.query(EmployeeSkillScore).filter(EmployeeSkillScore.employee_id == data["id"]).delete()
        for sk in data["skills"]:
            db.add(EmployeeSkillScore(
                employee_id=data["id"],
                skill_id=sk["skill_id"],
                current_score=sk["score"],
                target_score=sk["target"],
                status=sk["status"],
                trending=sk["trending"],
                last_assessed_at=datetime.now(timezone.utc)
            ))

        # Seed history
        db.query(CompetencyScoreHistory).filter(CompetencyScoreHistory.employee_id == data["id"]).delete()
        for hp in data["skills"][:3]:
            db.add(CompetencyScoreHistory(
                employee_id=data["id"],
                skill_id=hp["skill_id"],
                score=max(20, hp["score"] - 12),
                source="seed",
                recorded_at=now - timedelta(days=21)
            ))
            db.add(CompetencyScoreHistory(
                employee_id=data["id"],
                skill_id=hp["skill_id"],
                score=hp["score"],
                source="seed",
                recorded_at=now - timedelta(days=3)
            ))

        # Seed recommendation
        db.query(Recommendation).filter(Recommendation.employee_id == data["id"]).delete()
        rec_info = data["recommendation"]
        db.add(Recommendation(
            id=rec_info["id"],
            employee_id=data["id"],
            title=rec_info["title"],
            type=rec_info["type"],
            provider=rec_info["provider"],
            duration=rec_info["duration"],
            impact_skill=rec_info["impact_skill"],
            match_score=rec_info["match_score"],
            reason=rec_info["reason"],
            is_urgent=rec_info["is_urgent"]
        ))

        # Seed insight
        db.query(AiInsight).filter(AiInsight.employee_id == data["id"]).delete()
        ins_info = data["insight"]
        db.add(AiInsight(
            id=ins_info["id"],
            employee_id=data["id"],
            type=ins_info["type"],
            text=ins_info["text"]
        ))

        db.commit()

        mgr_label = data["manager_id"] if data["manager_id"] else "None (Specialist)"
        seeded_credentials.append({
            "id": data["id"],
            "name": data["name"],
            "email": data["email"],
            "password": data["password"],
            "role": "employee",
            "department": data["department"],
            "manager": mgr_label
        })

    # Print out formatted seeded login credentials
    print("\n" + "=" * 92)
    print("SEEDED MULTI-USER LOGIN CREDENTIALS (ALL PASSWORDS BCRYPT-HASHED IN DB)")
    print("=" * 92)
    header = f"{'ID':<10} | {'Name':<16} | {'Email/Username':<28} | {'Role':<9} | {'Dept':<18} | {'Test Password'}"
    print(header)
    print("-" * 92)
    for c in seeded_credentials:
        row = f"{c['id']:<10} | {c['name']:<16} | {c['email']:<28} | {c['role']:<9} | {c['department']:<18} | {c['password']}"
        print(row)
    print("=" * 92 + "\n")
