"""SkillStat AI - Analytics Service

Core aggregation logic for Admin and Manager Competency Telemetry.
Computes domain gaps, competency averages, department comparisons, and team drilldowns
across India's Official Statistical System framework.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.department import Department
from app.models.competency import Skill, CompetencyDomain, EmployeeSkillScore

# Standard 4-Domain canonical mapping for Official Statistical System
CANONICAL_DOMAINS = [
    "Statistical",
    "Technical",
    "Digital Governance",
    "Behavioural"
]

DOMAIN_ID_TO_CANONICAL = {
    "dom-statistical": "Statistical",
    "dom-technical": "Technical",
    "dom-digital-gov": "Digital Governance",
    "dom-behavioural": "Behavioural"
}


def _get_skill_to_canonical_domain(db: Session) -> Dict[str, str]:
    """Builds a lookup mapping from skill_id to its canonical domain name."""
    skills = db.query(Skill).all()
    lookup = {}
    for s in skills:
        if s.domain_id in DOMAIN_ID_TO_CANONICAL:
            lookup[s.id] = DOMAIN_ID_TO_CANONICAL[s.domain_id]
        else:
            # Fallback based on category or domain object
            cat = (s.category or "").lower()
            if "stat" in cat:
                lookup[s.id] = "Statistical"
            elif "tech" in cat or "comput" in cat:
                lookup[s.id] = "Technical"
            elif "govern" in cat or "digital" in cat or "cyber" in cat:
                lookup[s.id] = "Digital Governance"
            else:
                lookup[s.id] = "Behavioural"
    return lookup


def calculate_employee_domain_gaps(db: Session, employee_id: str) -> Dict[str, Any]:
    """
    Computes per-employee domain gaps:
    average (target_score - current_score, floored at 0) across evaluated skills in each domain.
    Also returns domain average current scores, skill breakdown, and top gap domain.
    """
    skill_domain_map = _get_skill_to_canonical_domain(db)
    scores = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == employee_id
    ).all()

    domain_gaps_raw: Dict[str, List[float]] = {d: [] for d in CANONICAL_DOMAINS}
    domain_scores_raw: Dict[str, List[float]] = {d: [] for d in CANONICAL_DOMAINS}
    skills_by_domain: Dict[str, List[Dict[str, Any]]] = {d: [] for d in CANONICAL_DOMAINS}

    skill_cache = {s.id: s for s in db.query(Skill).all()}

    for sc in scores:
        dom = skill_domain_map.get(sc.skill_id, "Statistical")
        gap = max(0.0, float(sc.target_score - sc.current_score))
        domain_gaps_raw[dom].append(gap)
        domain_scores_raw[dom].append(float(sc.current_score))

        sk_obj = skill_cache.get(sc.skill_id)
        skills_by_domain[dom].append({
            "skill_id": sc.skill_id,
            "skill_name": sk_obj.name if sk_obj else sc.skill_id,
            "current_score": sc.current_score,
            "target_score": sc.target_score,
            "gap": round(gap, 1),
            "status": sc.status
        })

    domain_gaps = {}
    domain_scores = {}
    radar_data = []

    for d in CANONICAL_DOMAINS:
        gaps = domain_gaps_raw[d]
        scs = domain_scores_raw[d]
        avg_gap = round(sum(gaps) / len(gaps), 2) if gaps else 0.0
        avg_score = round(sum(scs) / len(scs), 2) if scs else 70.0
        domain_gaps[d] = avg_gap
        domain_scores[d] = avg_score
        radar_data.append({
            "domain": d,
            "subject": d,
            "score": avg_score,
            "gap": avg_gap,
            "target": round(avg_score + avg_gap, 1)
        })

    # Find highest gap domain
    top_gap_domain = max(domain_gaps.items(), key=lambda x: x[1])

    return {
        "domain_gaps": domain_gaps,
        "domain_scores": domain_scores,
        "radar_data": radar_data,
        "skills_by_domain": skills_by_domain,
        "top_gap_domain": top_gap_domain[0],
        "top_gap_value": top_gap_domain[1]
    }


def calculate_department_domain_aggregates(db: Session, department_id: str) -> Dict[str, Any]:
    """
    Computes per-department competency aggregates:
    average of employee domain gaps across all staff in that department.
    """
    dept = db.query(Department).filter(
        (Department.id == department_id) | (Department.name == department_id)
    ).first()

    dept_id = dept.id if dept else department_id
    dept_name = dept.name if dept else department_id

    employees = db.query(Employee).filter(
        (Employee.department_id == dept_id) | (Employee.department == dept_name)
    ).all()

    # Filter to staff/employees who have competency profiles
    emp_staff = [e for e in employees if e.role == "employee"]
    if not emp_staff:
        emp_staff = employees

    if not emp_staff:
        return {
            "department_id": dept_id,
            "name": dept_name,
            "department": dept_name,
            "employee_count": 0,
            "readiness_score_avg": 0.0,
            "skill_index_avg": 0.0,
            "domain_averages": {d: 0.0 for d in CANONICAL_DOMAINS},
            "domain_gaps": [{"domain": d, "gap": 0.0, "score": 0.0} for d in CANONICAL_DOMAINS],
            "employees": [],
            "skills_breakdown": []
        }

    count = len(emp_staff)
    readiness_avg = round(sum(e.readiness_score for e in emp_staff) / count, 1)
    skill_index_avg = round(sum(e.skill_index for e in emp_staff) / count, 1)

    employee_analytics = [
        (e, calculate_employee_domain_gaps(db, e.id))
        for e in emp_staff
    ]

    domain_gaps_agg = {d: 0.0 for d in CANONICAL_DOMAINS}
    domain_scores_agg = {d: 0.0 for d in CANONICAL_DOMAINS}

    for d in CANONICAL_DOMAINS:
        domain_gaps_agg[d] = round(
            sum(ana["domain_gaps"][d] for _, ana in employee_analytics) / count,
            2
        )
        domain_scores_agg[d] = round(
            sum(ana["domain_scores"][d] for _, ana in employee_analytics) / count,
            2
        )

    domain_gaps_list = [
        {
            "domain": d,
            "gap": domain_gaps_agg[d],
            "score": domain_scores_agg[d],
            "target": round(domain_scores_agg[d] + domain_gaps_agg[d], 1)
        }
        for d in CANONICAL_DOMAINS
    ]

    drilldown_employees = [
        {
            "id": e.id,
            "name": e.name,
            "role_title": e.role_title,
            "target_role": e.target_role,
            "readiness_score": e.readiness_score,
            "skill_index": e.skill_index
        }
        for e in emp_staff
    ]

    # Department top skill breakdown
    all_scores = db.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id.in_([e.id for e in emp_staff])
    ).all()
    skill_scores_grouped: Dict[str, List[int]] = {}
    for sc in all_scores:
        skill_scores_grouped.setdefault(sc.skill_id, []).append(sc.current_score)

    skills_breakdown = []
    skill_map = {s.id: s for s in db.query(Skill).all()}
    for sk_id, scs in list(skill_scores_grouped.items())[:8]:
        sk = skill_map.get(sk_id)
        if sk:
            avg_score = round(sum(scs) / len(scs), 1)
            skills_breakdown.append({
                "skill_id": sk.id,
                "skill_name": sk.name,
                "average_score": avg_score,
                "target": 85
            })

    return {
        "department_id": dept_id,
        "name": dept_name,
        "department": dept_name,
        "employee_count": count,
        "readiness_score_avg": readiness_avg,
        "skill_index_avg": skill_index_avg,
        "domain_averages": domain_scores_agg,
        "domain_gaps": domain_gaps_list,
        "employees": drilldown_employees,
        "skills_breakdown": skills_breakdown
    }


def calculate_manager_team_aggregates(db: Session, manager_id: str) -> Dict[str, Any]:
    """
    Computes per-manager team competency aggregates:
    average of direct reports' domain scores and gaps, scoped strictly to manager_id.
    """
    manager = db.query(Employee).filter(Employee.id == manager_id).first()
    if not manager:
        return None

    reports = db.query(Employee).filter(Employee.manager_id == manager_id).all()
    count = len(reports)

    if count == 0:
        return {
            "manager_id": manager.id,
            "manager_name": manager.name,
            "department": manager.department or "Official Statistics",
            "department_id": manager.department_id,
            "team_size": 0,
            "readiness_avg": 0.0,
            "domain_averages": {d: 0.0 for d in CANONICAL_DOMAINS},
            "domain_gaps": [{"domain": d, "gap": 0.0, "score": 0.0} for d in CANONICAL_DOMAINS],
            "direct_reports": []
        }

    readiness_avg = round(sum(e.readiness_score for e in reports) / count, 1)

    direct_report_details = []
    report_analytics = []

    for r in reports:
        ana = calculate_employee_domain_gaps(db, r.id)
        report_analytics.append(ana)
        direct_report_details.append({
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "role_title": r.role_title,
            "department": r.department,
            "readiness_score": r.readiness_score,
            "skill_index": r.skill_index,
            "top_gap_domain": ana["top_gap_domain"],
            "top_gap_value": ana["top_gap_value"],
            "domain_gaps": ana["domain_gaps"]
        })

    domain_gaps_agg = {d: 0.0 for d in CANONICAL_DOMAINS}
    domain_scores_agg = {d: 0.0 for d in CANONICAL_DOMAINS}

    for d in CANONICAL_DOMAINS:
        domain_gaps_agg[d] = round(
            sum(ana["domain_gaps"][d] for ana in report_analytics) / count,
            2
        )
        domain_scores_agg[d] = round(
            sum(ana["domain_scores"][d] for ana in report_analytics) / count,
            2
        )

    domain_gaps_list = [
        {
            "domain": d,
            "gap": domain_gaps_agg[d],
            "score": domain_scores_agg[d],
            "target": round(domain_scores_agg[d] + domain_gaps_agg[d], 1)
        }
        for d in CANONICAL_DOMAINS
    ]

    return {
        "manager_id": manager.id,
        "manager_name": manager.name,
        "department": manager.department or "Official Statistics",
        "department_id": manager.department_id,
        "team_size": count,
        "readiness_avg": readiness_avg,
        "domain_averages": domain_scores_agg,
        "domain_gaps": domain_gaps_list,
        "direct_reports": direct_report_details
    }


def calculate_organization_aggregates(db: Session) -> Dict[str, Any]:
    """
    Computes organization-wide competency telemetry across all evaluated cadre.
    """
    employees = db.query(Employee).filter(Employee.role == "employee").all()
    if not employees:
        employees = db.query(Employee).all()

    total_emp = len(employees)
    if total_emp == 0:
        return {
            "total_employees": 0,
            "total_departments": 4,
            "overall_readiness_avg": 0.0,
            "overall_skill_index_avg": 0.0,
            "domain_averages": {d: 0.0 for d in CANONICAL_DOMAINS},
            "top_skill_gaps": [],
            "growth_stage_distribution": {
                "Seed & Sprout": 0, "Young Sapling": 0, "Young Tree": 0, "Blossoming Tree": 0
            }
        }

    readiness_avg = round(sum(e.readiness_score for e in employees) / total_emp, 1)
    skill_index_avg = round(sum(e.skill_index for e in employees) / total_emp, 1)

    employee_analytics = [calculate_employee_domain_gaps(db, e.id) for e in employees]

    domain_averages = {}
    for d in CANONICAL_DOMAINS:
        domain_averages[d] = round(
            sum(ana["domain_scores"][d] for ana in employee_analytics) / total_emp,
            1
        )

    # Top skill gaps across organization
    all_scores = db.query(EmployeeSkillScore).all()
    gap_by_skill: Dict[str, List[float]] = {}
    for s in all_scores:
        gap = max(0.0, float(s.target_score - s.current_score))
        gap_by_skill.setdefault(s.skill_id, []).append(gap)

    skill_map = {s.id: s for s in db.query(Skill).all()}
    top_gaps = []
    for skill_id, gaps in gap_by_skill.items():
        sk = skill_map.get(skill_id)
        if sk:
            avg_gap = round(sum(gaps) / len(gaps), 1)
            top_gaps.append({
                "skill_id": sk.id,
                "skill_name": sk.name,
                "category": sk.category,
                "average_gap": avg_gap
            })
    top_gaps.sort(key=lambda x: x["average_gap"], reverse=True)

    # Growth stage distribution
    growth_stages = {"Seed & Sprout": 0, "Young Sapling": 0, "Young Tree": 0, "Blossoming Tree": 0}
    for e in employees:
        if e.readiness_score < 25:
            growth_stages["Seed & Sprout"] += 1
        elif e.readiness_score < 50:
            growth_stages["Young Sapling"] += 1
        elif e.readiness_score < 75:
            growth_stages["Young Tree"] += 1
        else:
            growth_stages["Blossoming Tree"] += 1

    dept_count = db.query(Department).count() or 4

    return {
        "total_employees": total_emp,
        "total_departments": dept_count,
        "overall_readiness_avg": readiness_avg,
        "overall_skill_index_avg": skill_index_avg,
        "domain_averages": domain_averages,
        "top_skill_gaps": top_gaps[:5],
        "growth_stage_distribution": growth_stages
    }


def compare_departments(db: Session, department_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Compares multiple departments across the 4 canonical competency domains.
    Returns individual department summaries and cross-department chart_data for visualization.
    """
    if not department_ids:
        all_depts = db.query(Department).all()
        dept_ids = [d.id for d in all_depts]
    else:
        dept_ids = department_ids

    dept_summaries = []
    for d_id in dept_ids:
        dept_data = calculate_department_domain_aggregates(db, d_id)
        dept_summaries.append({
            "department_id": dept_data["department_id"],
            "department_name": dept_data["name"],
            "employee_count": dept_data["employee_count"],
            "readiness_avg": dept_data["readiness_score_avg"],
            "domain_averages": dept_data["domain_averages"],
            "domain_gaps": dept_data["domain_gaps"]
        })

    # Prepare Recharts-ready comparison rows by domain
    chart_data = []
    for d in CANONICAL_DOMAINS:
        row: Dict[str, Any] = {"domain": d}
        for item in dept_summaries:
            row[f"{item['department_name']}_gap"] = next(
                (g["gap"] for g in item["domain_gaps"] if g["domain"] == d), 0.0
            )
            row[f"{item['department_name']}_score"] = item["domain_averages"].get(d, 0.0)
        chart_data.append(row)

    return {
        "departments": dept_summaries,
        "chart_data": chart_data
    }
