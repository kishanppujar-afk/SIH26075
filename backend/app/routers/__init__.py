from app.routers.auth import router as auth_router
from app.routers.employees import router as employees_router
from app.routers.skills import router as skills_router
from app.routers.recommendations import router as recommendations_router
from app.routers.learning_resources import router as learning_resources_router
from app.routers.assessments import router as assessments_router
from app.routers.progress import router as progress_router
from app.routers.materials_quiz import router as materials_quiz_router
from app.routers.admin import router as admin_router
from app.routers.manager import router as manager_router
from app.routers.igot import router as igot_router
from app.routers.ai import router as ai_router
from app.routers.approvals_cms import router as approvals_cms_router
from app.routers.trainer_portal import router as trainer_portal_router
from app.routers.trainee_portal import router as trainee_portal_router
from app.routers.trainee_portal import courses_router as courses_router
from app.routers.competency import router as competency_router

__all__ = [
    "auth_router",
    "employees_router",
    "skills_router",
    "recommendations_router",
    "learning_resources_router",
    "assessments_router",
    "progress_router",
    "materials_quiz_router",
    "admin_router",
    "manager_router",
    "igot_router",
    "ai_router",
    "approvals_cms_router",
    "trainer_portal_router",
    "trainee_portal_router",
    "courses_router",
    "competency_router",
]
