# SkillStat AI - Backend API Contracts

Comprehensive mapping of backend REST API endpoints, request/response JSON contracts, and corresponding frontend React component consumers.

---

## 1. Authentication & Session

### `POST /api/auth/login`
- **Frontend Consumer**: [`LoginView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/LoginView.jsx)
- **Request Body**:
  ```json
  {
    "email_or_id": "EMP-2048",
    "password": "password123"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "employee": {
      "id": "EMP-2048",
      "name": "Aarav Sharma",
      "role": "Junior Full Stack Developer",
      "targetRole": "Senior Cloud Applications Engineer",
      "department": "Engineering & Digital Transformation",
      "avatarUrl": "https://images.unsplash.com/...",
      "readinessScore": 78,
      "skillIndex": 82,
      "completedCoursesCount": 14,
      "pendingAssessmentsCount": 2,
      "weeklyGoalHours": 6.0,
      "weeklyHoursLogged": 4.5
    }
  }
  ```

### `GET /api/auth/me`
- **Frontend Consumer**: [`SessionContext.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/context/SessionContext.jsx), [`Navbar.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/Navbar.jsx)
- **Headers**: `Authorization: Bearer <token>` (or defaults to demo user)
- **Response Shape**: Same `EmployeeResponse` as above.

---

## 2. Employee Profile & Dashboard Telemetry

### `GET /api/employees/me`
- **Frontend Consumer**: [`Dashboard.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/Dashboard.jsx), [`ProfileView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/ProfileView.jsx), [`KpiStatsRow.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/KpiStatsRow.jsx)
- **Response Shape (200 OK)**:
  ```json
  {
    "id": "EMP-2048",
    "name": "Aarav Sharma",
    "role": "Junior Full Stack Developer",
    "targetRole": "Senior Cloud Applications Engineer",
    "department": "Engineering & Digital Transformation",
    "avatarUrl": "https://images.unsplash.com/...",
    "readinessScore": 78,
    "skillIndex": 82,
    "completedCoursesCount": 14,
    "pendingAssessmentsCount": 2,
    "weeklyGoalHours": 6.0,
    "weeklyHoursLogged": 4.5
  }
  ```

### `PATCH /api/employees/me`
- **Frontend Consumer**: [`ProfileView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/ProfileView.jsx) (goal/target role adjustments)
- **Request Body**: Partial employee fields (e.g. `target_role`, `weekly_goal_hours`).

---

## 3. Skills & Competency Matrix

### `GET /api/skills?category={category}`
- **Frontend Consumer**: [`SkillsView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/SkillsView.jsx), [`Dashboard.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/Dashboard.jsx)
- **Query Params**: `category` (optional, e.g. "Technical", "Cloud & DevOps", "Architecture", "Soft Skills", "Statistical")
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": "s1",
      "name": "React & Modern Frontend",
      "category": "Technical",
      "currentScore": 85,
      "targetScore": 90,
      "status": "Proficient",
      "trending": "up"
    },
    {
      "id": "s2",
      "name": "Cloud Architecture (AWS/GCP)",
      "category": "Cloud & DevOps",
      "currentScore": 62,
      "targetScore": 85,
      "status": "Growth Opportunity",
      "trending": "up"
    }
  ]
  ```

---

## 4. Development Path & Learning Pathways

### `GET /api/skills/{id}/development-path`
- **Frontend Consumer**: [`DevelopmentPath.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/DevelopmentPath.jsx)
- **Response Shape (200 OK)**:
  ```json
  {
    "skill": {
      "id": "s4",
      "name": "Docker & Container Orchestration",
      "category": "Cloud & DevOps",
      "currentScore": 55,
      "targetScore": 80,
      "status": "Growth Opportunity",
      "trending": "up"
    },
    "gap": 25,
    "isOpportunity": true,
    "isExceeds": false,
    "recommendedResources": [
      {
        "title": "MCTP Phase I: Foundation Course on Artificial Intelligence and Big Data",
        "description": "Mandatory Mid-Career Training Programme...",
        "source": "NSSTA",
        "url": "https://nssta.gov.in/api/trainingcalendar/download/51",
        "matchScore": 92
      }
    ],
    "linkedAssessment": {
      "id": "asm1",
      "title": "Cloud Infrastructure & AWS Fundamentals",
      "estimatedMinutes": 15,
      "questionCount": 6
    }
  }
  ```

### `GET /api/recommendations`
- **Frontend Consumer**: [`CoursesView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/CoursesView.jsx), [`Dashboard.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/Dashboard.jsx)
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": "rec1",
      "title": "Accelerate Docker & Kubernetes Deployment",
      "type": "Course",
      "provider": "SkillStat Academy",
      "duration": "4.5 hrs",
      "impactSkill": "Docker & Container Orchestration",
      "matchScore": 96,
      "isUrgent": true,
      "reason": "Recommended because your Docker & Container Orchestration assessment result is 25 points below the required level for Senior Cloud Applications Engineer."
    }
  ]
  ```

---

## 5. Diagnostic Assessments & Baseline Discovery

### `GET /api/assessments`
- **Frontend Consumer**: [`AssessmentsView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/AssessmentsView.jsx), [`AssessmentHub.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/assessment/AssessmentHub.jsx)
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": "asm1",
      "title": "Cloud Infrastructure & AWS Fundamentals",
      "category": "Cloud & DevOps",
      "dueDate": "2026-09-18",
      "estimatedMinutes": 15,
      "status": "Ready for Baseline Discovery",
      "questionCount": 6,
      "targetRole": "Senior Cloud Applications Engineer",
      "description": "Map your foundational baseline across compute scaling, container orchestration, IaC, and resilient architecture."
    }
  ]
  ```

### `GET /api/assessments/{id}/questions`
- **Frontend Consumer**: [`AssessmentQuestionCard.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/assessment/AssessmentQuestionCard.jsx), [`AssessmentsView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/AssessmentsView.jsx)
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": "q1",
      "topic": "Compute & Scalability",
      "competency": "Cloud Architecture (AWS/GCP)",
      "scenario": "Your e-commerce application experiences predictable morning spikes...",
      "question": "Which architectural pattern provides automated scaling without over-provisioning static compute servers?",
      "options": [
        {"id": "q1-a", "text": "Configure an Auto Scaling Group with dynamic Target Tracking policies..."},
        {"id": "q1-b", "text": "Permanently deploy the maximum anticipated number of EC2 instances..."}
      ],
      "uncertaintyOption": {
        "id": "q1-unsure",
        "text": "I'm not sure yet — haven't worked with auto-scaling policies yet"
      },
      "correctOptionId": "q1-a",
      "rationale": "Target tracking scaling policies automatically adjust capacity in response to dynamic workload changes.",
      "growthResource": {
        "title": "Designing Resilient Cloud Architecture with AWS",
        "type": "Hands-on Lab",
        "duration": "6.0 hrs"
      }
    }
  ]
  ```

### `POST /api/assessments/{id}/attempts`
- Starts a new diagnostic baseline discovery attempt.

### `PATCH /api/attempts/{attempt_id}/answers`
- **Frontend Consumer**: [`AssessmentQuestionCard.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/assessment/AssessmentQuestionCard.jsx) (quiet auto-save).
- **Request Body**: `{"question_id": "q1", "selected_option_id": "q1-a"}`.

### `POST /api/attempts/{attempt_id}/submit`
- **Frontend Consumer**: [`AssessmentResults.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/assessment/AssessmentResults.jsx)
- **Response Shape (200 OK)**:
  ```json
  {
    "attempt_id": "att-123456",
    "overallScore": 88.0,
    "baselineLevel": "Solid Foundation (88%)",
    "capabilityList": [
      {
        "name": "Cloud Architecture (AWS/GCP)",
        "score": 85,
        "target": 85,
        "status": "Proficient"
      }
    ],
    "confidentCorrect": [
      {
        "id": "q1",
        "topic": "Compute & Scalability",
        "competency": "Cloud Architecture (AWS/GCP)",
        "question": "Which architectural pattern...",
        "rationale": "..."
      }
    ],
    "growthOpportunities": [
      {
        "id": "q2",
        "topic": "Container Orchestration",
        "competency": "Docker & Container Orchestration",
        "question": "How does containerization...",
        "rationale": "...",
        "growthResource": {
          "title": "Accelerate Docker & Kubernetes Deployment",
          "type": "Course",
          "duration": "4.5 hrs"
        },
        "isUncertain": true
      }
    ]
  }
  ```

---

## 6. Growth Tree & Progress

### `GET /api/employees/me/growth-stage`
- **Frontend Consumer**: [`GrowthTreeWidget.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/GrowthTreeWidget.jsx), [`ProfileView.jsx`](file:///c:/Users/kisha/OneDrive/Desktop/skillstat-ai/src/components/ProfileView.jsx)
- **Response Shape (200 OK)**:
  ```json
  {
    "stage": 3,
    "name": "Blossoming Tree",
    "title": "Blossoming Tree",
    "description": "Your expertise is beginning to blossom.",
    "readinessScore": 78,
    "blossomPercentage": 78
  }
  ```

### `GET /api/employees/me/progress`
- Returns historical score trajectory and readiness trends.

---

## 7. AI Training Materials & Adaptive Quiz Generator

### `POST /api/materials/upload`
- Multipart file upload (PDF/TXT/MD). Extracts text cleanly and stores material row.

### `POST /api/materials/{id}/generate-quiz`
- Invokes local Ollama `gemma3:4b` (or labeled fallback) to generate MCQs with options, correct answer index, explanations, and source snippet.

### `POST /api/quiz-attempts/{id}/submit`
- Evaluates quiz attempt and returns score, question breakdowns, and personalized coaching feedback generated by `gemma3:4b`.

---

## 8. Admin Analytics (MoSPI / Cadre Management)

- `GET /api/admin/organization-competency-summary`
- `GET /api/admin/department-competency/{department}`
- `GET /api/admin/skill-gap-distribution`
- `GET /api/admin/training-participation`
- `GET /api/admin/training-effectiveness`

---

## 9. iGOT Karmayogi Adapter (Isolated Interface)

- `GET /api/igot/status`: Telemetry status indicating interface is active and staged pending official government access.
- `GET /api/igot/courses`: Clean interface call with documented fallback.
