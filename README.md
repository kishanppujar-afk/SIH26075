# SkillStat AI - Digital Capacity Building & LMS (SIH 1729)

This repository contains the complete solution for the **MoES / IMD Digital Capacity Building and Learning Management System** (SIH Problem Statement ID 1729).

It is a monorepo consisting of three main parts:
1. **Trainee Portal (Frontend):** React + Vite (`src/`)
2. **Admin & Trainer Studio (Frontend):** React + Vite (`SkillStatAI-manager-admin-ui/`)
3. **AI Backend (FastAPI):** Python + SQLite (`backend/`)

---

## Prerequisites
Before you run this project on a new computer, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

---

## 🚀 How to Run on a New Computer

You will need to open **three separate terminal windows** (one for each part of the stack).

### Terminal 1: Start the AI Backend (FastAPI)
This runs the Python backend that powers DISHA, the RAG pipelines, and the database.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   * **Windows:** `.venv\Scripts\activate`
   * **Mac/Linux:** `source .venv/bin/activate`
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
*(The backend will now be running on `http://127.0.0.1:8000`)*

---

### Terminal 2: Start the Trainee Portal
This is the main portal where employees track their Skill Index and take courses.

1. Open a new terminal and navigate to the project root folder.
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
*(The Trainee Portal will open on `http://localhost:3000`)*

---

### Terminal 3: Start the Admin & Trainer Studio
This is the dashboard where trainers upload materials and management views analytics.

1. Open a third terminal and navigate to the admin folder:
   ```bash
   cd SkillStatAI-manager-admin-ui
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev -- --port 3001
   ```
*(The Admin Studio will open on `http://localhost:3001`)*

---

## 📊 Included Demo Data
The repository includes a pre-populated SQLite database (`backend/skillstat.db`) containing generated mock data for the hackathon demo, including:
- Simulated employees for the **Regional Meteorological Centre, Delhi**.
- Pre-calculated **Skill Gaps** and **Readiness Scores**.
- RAG-generated sample quizzes and uploaded materials.

If you ever need to reset the database to a clean state with fresh random data, run:
```bash
cd backend
python -m app.seed.seed_demo_employee
```

## 🔒 Default Logins for Testing
When demonstrating the platform, you can use these test accounts:

**Admin/Manager Login:**
- Email: `admin@mospi.gov.in`
- Password: `password123`

**Trainer Login:**
- Email: `trainer@mospi.gov.in` (Dr. S.K. Roy)
- Password: `password123`

**Trainee Login:**
- Email: `ramesh.kumar@mospi.gov.in` (Or any registered employee)
- Password: `password123`
