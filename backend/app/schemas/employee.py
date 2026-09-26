from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    name: str
    email: str
    designation: Optional[str] = None
    department: str = "Engineering & Digital Transformation"
    role_title: str = "Junior Full Stack Developer"
    target_role: str = "Senior Cloud Applications Engineer"
    education: Optional[str] = None
    experience_years: float = 2.0
    avatar_url: str = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role_title: Optional[str] = None
    target_role: Optional[str] = None
    department: Optional[str] = None
    weekly_goal_hours: Optional[float] = None
    weekly_hours_logged: Optional[float] = None


class EmployeeResponse(BaseModel):
    id: str
    name: str
    role: str = Field(..., serialization_alias="role")
    targetRole: str = Field(..., serialization_alias="targetRole")
    department: str
    avatarUrl: str = Field(..., serialization_alias="avatarUrl")
    readinessScore: int = Field(..., serialization_alias="readinessScore")
    skillIndex: int = Field(..., serialization_alias="skillIndex")
    completedCoursesCount: int = Field(..., serialization_alias="completedCoursesCount")
    pendingAssessmentsCount: int = Field(..., serialization_alias="pendingAssessmentsCount")
    weeklyGoalHours: float = Field(..., serialization_alias="weeklyGoalHours")
    weeklyHoursLogged: float = Field(..., serialization_alias="weeklyHoursLogged")
    email: Optional[str] = None
    designation: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[float] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employee: EmployeeResponse


class LoginRequest(BaseModel):
    email_or_id: str
    password: str = "password123"


class RegisterRequest(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    password: str = "password123"
    role_title: Optional[str] = "Junior Full Stack Developer"
    target_role: Optional[str] = "Senior Cloud Applications Engineer"
    department: Optional[str] = "Engineering & Digital Transformation"
