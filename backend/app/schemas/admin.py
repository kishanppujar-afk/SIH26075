from typing import List, Dict, Any
from pydantic import BaseModel


class OrgCompetencySummary(BaseModel):
    total_employees: int
    overall_readiness_avg: float
    overall_skill_index_avg: float
    domain_averages: Dict[str, float]
    top_skill_gaps: List[Dict[str, Any]]
    growth_stage_distribution: Dict[str, int]


class DepartmentCompetency(BaseModel):
    department: str
    employee_count: int
    readiness_score_avg: float
    skill_index_avg: float
    skills_breakdown: List[Dict[str, Any]]


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
