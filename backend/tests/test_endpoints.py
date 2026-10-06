import pytest


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "ollama" in data
    assert "igot_adapter" in data


def test_auth_login_and_me(client):
    # Login with demo credentials
    login_resp = client.post("/api/auth/login", json={
        "email_or_id": "EMP-2048",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Call /api/auth/me with bearer token
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["id"] == "EMP-2048"
    assert me_resp.json()["name"] == "Aarav Sharma"


def test_employees_me(client):
    resp = client.get("/api/employees/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "EMP-2048"
    assert data["role"] == "employee"
    assert data["role_title"] == "Junior Full Stack Developer"
    assert data["targetRole"] == "Senior Cloud Applications Engineer"
    assert "readinessScore" in data
    assert "skillIndex" in data


def test_skills_catalog(client):
    resp = client.get("/api/skills")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 6
    skill_ids = [s["id"] for s in data]
    assert "s1" in skill_ids
    assert "s4" in skill_ids

    # Test filtering by category
    resp_tech = client.get("/api/skills?category=Technical")
    assert resp_tech.status_code == 200
    tech_data = resp_tech.json()
    assert all(s["category"] == "Technical" for s in tech_data)


def test_development_path_endpoint(client):
    resp = client.get("/api/skills/s4/development-path")
    assert resp.status_code == 200
    data = resp.json()
    assert data["skill"]["id"] == "s4"
    assert "gap" in data
    assert "isOpportunity" in data
    assert len(data["recommendedResources"]) > 0
    assert data["recommendedResources"][0]["source"] in ["NSSTA", "MoSPI"]


def test_recommendations_endpoint(client):
    resp = client.get("/api/recommendations")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 3
    assert data[0]["id"] == "rec1"
    assert "impactSkill" in data[0]
    assert "matchScore" in data[0]


def test_learning_resources_catalog(client):
    resp = client.get("/api/learning-resources?limit=10")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    assert "source" in data[0]
    assert "url" in data[0]


def test_assessment_flow(client):
    # 1. Get assessments
    resp_asm = client.get("/api/assessments")
    assert resp_asm.status_code == 200
    asm_list = resp_asm.json()
    assert len(asm_list) >= 3
    assert asm_list[0]["id"] == "asm1"

    # 2. Get questions for asm1
    resp_q = client.get("/api/assessments/asm1/questions")
    assert resp_q.status_code == 200
    questions = resp_q.json()
    assert len(questions) == 6
    assert questions[0]["id"] == "q1"
    assert "uncertaintyOption" in questions[0]
    assert len(questions[0]["options"]) == 4

    # 3. Start attempt
    resp_start = client.post("/api/assessments/asm1/attempts")
    assert resp_start.status_code == 200
    att_id = resp_start.json()["attempt_id"]

    # 4. Autosave an answer
    resp_save = client.patch(f"/api/attempts/{att_id}/answers", json={
        "question_id": "q1",
        "selected_option_id": "q1-a"
    })
    assert resp_save.status_code == 200

    # 5. Submit and evaluate attempt
    resp_submit = client.post(f"/api/attempts/{att_id}/submit")
    assert resp_submit.status_code == 200
    eval_data = resp_submit.json()
    assert "overallScore" in eval_data
    assert "baselineLevel" in eval_data
    assert "capabilityList" in eval_data
    assert "confidentCorrect" in eval_data
    assert "growthOpportunities" in eval_data


def test_progress_and_growth_stage(client):
    # Progress
    resp_p = client.get("/api/employees/me/progress")
    assert resp_p.status_code == 200
    p_data = resp_p.json()
    assert "history" in p_data
    assert "readinessScoreTrend" in p_data

    # Growth stage
    resp_g = client.get("/api/employees/me/growth-stage")
    assert resp_g.status_code == 200
    g_data = resp_g.json()
    assert g_data["stage"] in [2, 3]
    assert "Tree" in g_data["name"] or "Blossom" in g_data["name"]


def test_admin_analytics(client):
    # Unauthenticated attempt should fail with 401
    resp_unauth = client.get("/api/admin/organization-competency-summary")
    assert resp_unauth.status_code == 401

    # Authenticate as admin
    login_resp = client.post("/api/auth/login", json={
        "email_or_id": "admin@mospi.gov.in",
        "password": "AdminPass123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp_summary = client.get("/api/admin/organization-competency-summary", headers=headers)
    assert resp_summary.status_code == 200
    data = resp_summary.json()
    assert "total_employees" in data
    assert "domain_averages" in data
    assert "growth_stage_distribution" in data

    resp_dept = client.get("/api/admin/department-competency/labour-statistics", headers=headers)
    assert resp_dept.status_code == 200
    dept_data = resp_dept.json()
    assert dept_data["department_id"] == "labour-statistics"
    assert "domain_averages" in dept_data



def test_igot_router(client):
    resp = client.get("/api/igot/status")
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending_official_access"

    resp_courses = client.get("/api/igot/courses")
    assert resp_courses.status_code == 200
    assert resp_courses.json()["status"] == "pending_official_access"


def test_disha_chat_endpoint(client):
    resp = client.post("/api/ai/chat", json={
        "message": "What should I focus on next to improve my score?",
        "conversation_history": []
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert len(data["response"]) > 10
    assert data["generated_by"] in ["local_llm", "template_fallback"]

