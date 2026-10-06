from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class OrgCompetencySummary(BaseModel):
    total_employees: int
    total_departments: int = 4
    overall_readiness_avg: float
    overall_skill_index_avg: float = 0.0
    domain_averages: Dict[str, float]  # 4 values: Statistical, Technical, Digital Governance, Behavioural
    top_skill_gaps: List[Dict[str, Any]] = []
    growth_stage_distribution: Dict[str, int] = {}


class DepartmentEmployeeDrilldown(BaseModel):
    id: str
    name: str
    role_title: Optional[str] = None
    target_role: Optional[str] = None
    readiness_score: int
    skill_index: int = 0


class DepartmentCompetency(BaseModel):
    department_id: Optional[str] = None
    name: Optional[str] = None
    department: str
    employee_count: int
    readiness_score_avg: float
    skill_index_avg: float = 0.0
    domain_averages: Dict[str, float] = {}  # 4 values: Statistical, Technical, Digital Governance, Behavioural
    domain_gaps: List[Dict[str, Any]] = []
    employees: List[DepartmentEmployeeDrilldown] = []
    skills_breakdown: List[Dict[str, Any]] = []


class DepartmentCompareItem(BaseModel):
    department_id: str
    department_name: str
    employee_count: int
    readiness_avg: float
    domain_averages: Dict[str, float]
    domain_gaps: List[Dict[str, Any]]


class DepartmentCompareResponse(BaseModel):
    departments: List[DepartmentCompareItem]
    chart_data: List[Dict[str, Any]]  # Domain-level comparison rows for Recharts


class EmployeeCompetencyProfile(BaseModel):
    id: str
    name: str
    department: str
    department_id: Optional[str] = None
    target_role: Optional[str] = None
    role_title: Optional[str] = None
    readiness_score: int
    domain_gaps: Dict[str, float]  # 4 values: Statistical, Technical, Digital Governance, Behavioural
    radar_data: List[Dict[str, Any]] = []
    skills_by_domain: Dict[str, List[Dict[str, Any]]] = {}


class DirectReportSummary(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    role_title: Optional[str] = None
    department: Optional[str] = None
    readiness_score: int
    skill_index: int = 0
    top_gap_domain: str
    top_gap_value: float
    domain_gaps: Dict[str, float]


class ManagerTeamResponse(BaseModel):
    manager_id: str
    manager_name: str
    department: str
    department_id: Optional[str] = None
    direct_reports_count: int
    direct_reports: List[DirectReportSummary]


class ManagerTeamCompetencyResponse(BaseModel):
    manager_id: str
    manager_name: str
    department: str
    department_id: Optional[str] = None
    team_size: int
    readiness_avg: float
    domain_averages: Dict[str, float]  # 4 values: Statistical, Technical, Digital Governance, Behavioural
    domain_gaps: List[Dict[str, Any]]
    direct_reports: List[Dict[str, Any]]


class SkillGapDistribution(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    average_current_score: float
    average_target_score: float
    average_gap: float
    employee_count_evaluated: int


class TrainingParticipation(BaseModel):
    total_recommendations: int
    urgent_recommendations: int
    completed_courses_total: int
    source_breakdown: Dict[str, int]
    top_engaged_resources: List[Dict[str, Any]]


class TrainingEffectiveness(BaseModel):
    completed_assessments_count: int
    average_improvement_points: float
    baseline_distribution: Dict[str, int]
