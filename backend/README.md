# SkillStat AI - Backend

**MoSPI / NSSTA Problem Statement 26101: AI-enabled Skill Intelligence and Learning Platform for India's Official Statistical System.**

A modular, high-performance Python FastAPI backend with SQLite database, local Ollama AI integration (`gemma3:4b` for LLM generation and `nomic-embed-text` for semantic vector embeddings), isolated iGOT Karmayogi adapter, and authentic NSSTA/MoSPI training catalogue.

---

## Architecture Overview

- **Framework**: FastAPI (asynchronous, OpenAPI auto-documentation at `/docs`)
- **Database**: SQLite (`skillstat.db`), managed via SQLAlchemy 2.0 ORM and Alembic migrations. (Easily swapped for PostgreSQL via `DATABASE_URL` in `.env`).
- **Authentication**: JWT token authentication with bcrypt password hashing; defaults seamlessly to demo official `EMP-2048` (Aarav Sharma) during frictionless local development.
- **Local AI Integration**:
  - LLM: `gemma3:4b` running via local Ollama (`http://localhost:11434`) for diagnostic question generation, skill-gap analysis, and personalized coaching feedback.
  - Embeddings: `nomic-embed-text` (768 dimensions) for vector cosine similarity search across training programmes and competencies.
  - Deterministic Fallback: If Ollama is offline or busy, all AI endpoints automatically and transparently switch to template-based heuristics, clearly tagged with `"generated_by": "template_fallback"`.
- **Official Training Catalogue**: 53 verified training programmes, syllabi, and publications directly from NSSTA and MoSPI.
- **Isolated iGOT Karmayogi Adapter**: Pure interface/adapter layer without fabricated endpoints or guessed credentials, ready for plug-in when official credentials are provided.

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point & CORS
│   ├── core/                    # Config, database engine, security & JWT
│   ├── models/                  # SQLAlchemy ORM models
│   ├── schemas/                 # Pydantic request/response validation schemas
│   ├── routers/                 # Modular domain routers (auth, skills, assessments, etc.)
│   ├── services/                # Business logic (scoring, gap analysis, progress, extraction)
│   ├── ai/                      # AI integration boundary (local LLM, embeddings, fallbacks)
│   ├── integrations/            # Clean isolated iGOT adapter & NSSTA catalogue
│   └── seed/                    # Database seeder scripts
├── alembic/                     # Database migrations
├── tests/                       # Automated pytest suite
├── requirements.txt             # Python dependencies
├── .env.example                 # Committed template environment variables
├── API_CONTRACTS.md             # Full endpoint contract documentation
└── README.md                    # Setup and execution guide
```

---

## Quickstart & Local Setup

### 1. Create and Activate Virtual Environment

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Default `.env` values:
```ini
DATABASE_URL=sqlite:///./skillstat.db
SECRET_KEY=skillstat_hackathon_mospi_secret_key_change_in_production_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
UPLOAD_DIR=./uploads
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]
```

### 4. Apply Database Migrations

```bash
alembic upgrade head
```

### 5. Seed Database

Populate database with competency domains, 27 skills, 53 authentic NSSTA/MoSPI training resources, 3 diagnostic assessments, 6 questions with uncertainty options, and demo official `EMP-2048`:

```bash
python -m app.seed.run_all
```

---

## Running the Backend

Start the development server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check & Model Telemetry**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## Ollama Setup & AI Boundary

SkillStat AI connects to your local Ollama installation:
1. Ensure Ollama is running:
   ```bash
   ollama serve
   ```
2. Pull the required models (if not already downloaded):
   ```bash
   ollama pull gemma3:4b
   ollama pull nomic-embed-text
   ```

### What Happens If Ollama Is Offline?
Zero crashes. SkillStat AI features an explicit **AI Integration Boundary** (`app/ai/base.py`):
- If Ollama is unreachable, `app/ai/fallback.py` activates deterministic, rule-based responses.
- Every response includes an explicit provenance field (`"generated_by": "template_fallback"` vs `"generated_by": "local_llm"`), ensuring complete transparency.

---

## Running Automated Tests

Run the complete test suite:

```bash
pytest -v
```

Tests cover:
- Diagnostic assessment scoring logic (`test_scoring_service.py`)
- Skill-gap analysis & resource matching (`test_gap_analysis.py`)
- AI boundary & fallback transparency (`test_ai_fallback.py`)
- Isolated iGOT adapter contract (`test_igot_adapter.py`)
- All primary REST API endpoints (`test_endpoints.py`)

---

## Isolated iGOT Karmayogi Adapter

Per architectural guidelines, iGOT endpoints and authentication are not fabricated.
- Located at: `app/integrations/igot_adapter.py`
- Exposes standard methods (`get_course_catalogue`, `get_course_details`, `recommend_courses`, `enroll_employee`, `get_enrollment_status`, `sync_competency_update`).
- Unimplemented live methods raise `NotImplementedError("iGOT integration pending official API access")`.
- When official government credentials and endpoint specifications are provided, only `app/integrations/igot_adapter.py` needs to be updated.
