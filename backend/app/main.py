"""SkillStat AI - FastAPI Application Entrypoint

Backend for MoSPI/NSSTA Problem Statement 26101:
AI-enabled Skill Intelligence and Learning Platform for India's Official Statistical System.
"""
import os
from contextlib import asynccontextmanager
from typing import Dict, Any
import httpx
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, get_db
import app.models  # Ensure all models are registered with Base metadata
from app.routers import (
    auth_router,
    employees_router,
    skills_router,
    recommendations_router,
    learning_resources_router,
    assessments_router,
    progress_router,
    materials_quiz_router,
    admin_router,
    igot_router,
    ai_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created if alembic or seed hasn't run yet
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="SkillStat AI Backend",
    description="MoSPI / NSSTA Problem Statement 26101: AI-enabled Skill Intelligence and Learning Platform",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health & Status"])
async def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Comprehensive health check verifying SQLite database and local Ollama models.
    """
    # 1. Database check
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    # 2. Ollama local LLM & Embedding check
    ollama_status = "disconnected"
    ollama_models = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                ollama_models = [m.get("name") for m in data.get("models", [])]
                ollama_status = "connected"
    except Exception:
        ollama_status = "unavailable"

    has_llm = any(settings.OLLAMA_MODEL in m for m in ollama_models)
    has_embed = any(settings.OLLAMA_EMBEDDING_MODEL in m for m in ollama_models)

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "service": "SkillStat AI Backend (MoSPI/NSSTA PS 26101)",
        "version": settings.VERSION,
        "database": {
            "type": "SQLite",
            "status": db_status
        },
        "ollama": {
            "status": ollama_status,
            "base_url": settings.OLLAMA_BASE_URL,
            "configured_llm": settings.OLLAMA_MODEL,
            "llm_available": has_llm,
            "configured_embedding": settings.OLLAMA_EMBEDDING_MODEL,
            "embedding_available": has_embed,
            "detected_models": ollama_models,
            "fallback_mode": "active" if not has_llm else "ready"
        },
        "igot_adapter": {
            "status": "pending_official_access",
            "message": "Interface staged cleanly. Pending official credentials and API specifications."
        }
    }


# Mount all routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(employees_router, prefix="/api")
app.include_router(skills_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(learning_resources_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(materials_quiz_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(igot_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "SkillStat AI Backend API is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
