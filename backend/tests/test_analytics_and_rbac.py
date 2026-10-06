"""SkillStat AI - Analytics & RBAC Test Suite (Phase 3C)

Tests:
1. Real 4-Domain Competency Gap calculations and mathematical exactness.
2. Department and Team Aggregations.
3. Strict RBAC enforcement (401 unauthenticated, 403 forbidden for wrong role).
4. Manager data isolation (Manager A blocked from Manager B).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


def get_token(client: TestClient, email: str, password: str) -> str:
    resp = client.post("/api/auth/login", json={"email_or_id": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


def test_analytics_mathematical_gap_exactness(client: TestClient):
    """
    Verifies that domain gaps are computed as average(max(0, target - current))
    for EMP-2048 across the 4 real canonical domains.
    """
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.get("/api/admin/employees/EMP-2048/competency-profile", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] == "EMP-2048"
    gaps = data["domain_gaps"]

    # Hand-calculated values for EMP-2048:
    # Statistical: 4 skills: Sampling(37), Price(27), National Accounts(19), SDG(11) -> 94/4 = 23.5
    # Technical: React (90 - 85) = 5.0
    # Digital Governance: DPI (80 - 70) = 10.0
    # Behavioural: Collaboration (88 - 92 <= 0) = 0.0
    assert gaps["Statistical"] == 23.5
    assert gaps["Technical"] == 5.0
    assert gaps["Digital Governance"] == 10.0
    assert gaps["Behavioural"] == 0.0

    # Verify radar data format
    radar = data["radar_data"]
    assert len(radar) == 4
    domains_in_radar = {r["subject"] for r in radar}
    assert domains_in_radar == {"Statistical", "Technical", "Digital Governance", "Behavioural"}


def test_department_aggregation_arithmetic(client: TestClient):
    """
    Verifies that department domain aggregates equal the average of employee domain gaps.
    For Labour Statistics (EMP-2048, EMP-2049, EMP-2050):
    Statistical: (23.5 + 9.67 + 29.75) / 3 = 20.97
    Technical: (5.0 + 40.0 + 25.0) / 3 = 23.33
    Digital Governance: (10.0 + 15.0 + 20.0) / 3 = 15.00
    Behavioural: (0.0 + 2.0 + 2.5) / 3 = 1.50
    """
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.get("/api/admin/department-competency/labour-statistics", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["employee_count"] == 3
    assert len(data["employees"]) == 3

    gaps_by_domain = {g["domain"]: g["gap"] for g in data["domain_gaps"]}
    assert abs(gaps_by_domain["Statistical"] - 20.97) < 0.05
    assert abs(gaps_by_domain["Technical"] - 23.33) < 0.05
    assert abs(gaps_by_domain["Digital Governance"] - 15.00) < 0.05
    assert abs(gaps_by_domain["Behavioural"] - 1.50) < 0.05


def test_admin_rbac_restrictions(client: TestClient):
    """
    Verifies strict RBAC on /api/admin/*:
    - Unauthenticated -> 401
    - Employee -> 403
    - Manager -> 403
    - Admin -> 200
    """
    emp_token = get_token(client, "aarav.sharma@mospi.gov.in", "password123")
    mgr_token = get_token(client, "pooja.sengupta@mospi.gov.in", "ManagerPass123!")
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")

    # 1. Unauthenticated
    resp_unauth = client.get("/api/admin/organization-competency-summary")
    assert resp_unauth.status_code == 401

    # 2. Employee role -> 403
    resp_emp = client.get(
        "/api/admin/organization-competency-summary",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert resp_emp.status_code == 403
    assert "Admin role required" in resp_emp.json()["detail"]

    # 3. Manager role -> 403
    resp_mgr = client.get(
        "/api/admin/organization-competency-summary",
        headers={"Authorization": f"Bearer {mgr_token}"}
    )
    assert resp_mgr.status_code == 403
    assert "Admin role required" in resp_mgr.json()["detail"]

    # 4. Admin role -> 200
    resp_admin = client.get(
        "/api/admin/organization-competency-summary",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin.status_code == 200
    data = resp_admin.json()
    assert data["total_employees"] == 9
    assert "Statistical" in data["domain_averages"]
    assert "Technical" in data["domain_averages"]
    assert "Digital Governance" in data["domain_averages"]
    assert "Behavioural" in data["domain_averages"]


def test_department_compare_endpoint(client: TestClient):
    """
    Verifies /api/admin/departments/compare returns all 4 departments and Recharts chart_data.
    """
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.get("/api/admin/departments/compare", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["departments"]) == 4
    dept_names = {d["department_name"] for d in data["departments"]}
    assert "Labour Statistics" in dept_names
    assert "Price Statistics" in dept_names
    assert "National Accounts" in dept_names
    assert "Survey Design" in dept_names

    assert len(data["chart_data"]) == 4
    domains_in_chart = {row["domain"] for row in data["chart_data"]}
    assert domains_in_chart == {"Statistical", "Technical", "Digital Governance", "Behavioural"}


def test_manager_team_endpoints_and_rbac(client: TestClient):
    """
    Verifies /api/manager/my-team and /api/manager/team-competency:
    - Employee -> 403
    - Admin -> 403
    - Manager MGR-101 -> 200 with direct reports and exact team aggregates.
    """
    emp_token = get_token(client, "aarav.sharma@mospi.gov.in", "password123")
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")
    mgr_token = get_token(client, "pooja.sengupta@mospi.gov.in", "ManagerPass123!")

    # 1. Employee calling manager route -> 403
    resp_emp = client.get("/api/manager/my-team", headers={"Authorization": f"Bearer {emp_token}"})
    assert resp_emp.status_code == 403
    assert "Manager role required" in resp_emp.json()["detail"]

    # 2. Admin calling manager route -> 403 (strict role separation)
    resp_admin = client.get("/api/manager/my-team", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp_admin.status_code == 403
    assert "Manager role required" in resp_admin.json()["detail"]

    # 3. Manager calling my-team -> 200
    resp_mgr = client.get("/api/manager/my-team", headers={"Authorization": f"Bearer {mgr_token}"})
    assert resp_mgr.status_code == 200
    team_data = resp_mgr.json()
    assert team_data["manager_id"] == "MGR-101"
    assert team_data["direct_reports_count"] == 3
    report_ids = [r["id"] for r in team_data["direct_reports"]]
    assert report_ids == ["EMP-2048", "EMP-2049", "EMP-2050"]

    # Check top gap analysis per report
    for r in team_data["direct_reports"]:
        assert "top_gap_domain" in r
        assert "top_gap_value" in r
        assert len(r["domain_gaps"]) == 4

    # 4. Manager calling team-competency -> 200
    resp_comp = client.get("/api/manager/team-competency", headers={"Authorization": f"Bearer {mgr_token}"})
    assert resp_comp.status_code == 200
    comp_data = resp_comp.json()
    assert comp_data["team_size"] == 3
    gaps_by_domain = {g["domain"]: g["gap"] for g in comp_data["domain_gaps"]}
    assert abs(gaps_by_domain["Statistical"] - 20.97) < 0.05
    assert abs(gaps_by_domain["Technical"] - 23.33) < 0.05


def test_manager_isolation(client: TestClient):
    """
    Verifies that Manager A (MGR-101) is strictly blocked from accessing Manager B's (MGR-102) team telemetry.
    """
    mgr101_token = get_token(client, "pooja.sengupta@mospi.gov.in", "ManagerPass123!")
    mgr102_token = get_token(client, "suresh.raman@mospi.gov.in", "ManagerPass123!")

    # Manager 101 requests own team -> 200 OK
    resp_own = client.get(
        "/api/manager/teams/MGR-101",
        headers={"Authorization": f"Bearer {mgr101_token}"}
    )
    assert resp_own.status_code == 200
    assert resp_own.json()["manager_id"] == "MGR-101"

    # Manager 101 attempts to access Manager 102's team -> 403 Forbidden!
    resp_blocked = client.get(
        "/api/manager/teams/MGR-102",
        headers={"Authorization": f"Bearer {mgr101_token}"}
    )
    assert resp_blocked.status_code == 403
    assert "You cannot access another manager's team data" in resp_blocked.json()["detail"]

    # Manager 102 requests own team -> 200 OK
    resp_mgr102 = client.get(
        "/api/manager/teams/MGR-102",
        headers={"Authorization": f"Bearer {mgr102_token}"}
    )
    assert resp_mgr102.status_code == 200
    assert resp_mgr102.json()["manager_id"] == "MGR-102"
    assert resp_mgr102.json()["direct_reports_count"] == 2


def test_admin_manager_team_endpoint_rbac(client: TestClient):
    """
    Verifies /api/admin/managers/{manager_id}/team:
    - Admin can fetch ANY manager's team (MGR-101, MGR-102, etc.)
    - Manager (even the correct one) gets 403 Forbidden
    - Employee gets 403 Forbidden
    - Unauthenticated gets 401 Unauthorized
    """
    admin_token = get_token(client, "admin@mospi.gov.in", "AdminPass123!")
    mgr101_token = get_token(client, "pooja.sengupta@mospi.gov.in", "ManagerPass123!")
    emp_token = get_token(client, "aarav.sharma@mospi.gov.in", "password123")

    # 1. Admin can fetch MGR-101's team
    resp_admin_mgr101 = client.get(
        "/api/admin/managers/MGR-101/team",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin_mgr101.status_code == 200
    data_101 = resp_admin_mgr101.json()
    assert data_101["manager_id"] == "MGR-101"
    assert data_101["direct_reports_count"] == 3
    assert len(data_101["direct_reports"]) == 3

    # 2. Admin can fetch MGR-102's team
    resp_admin_mgr102 = client.get(
        "/api/admin/managers/MGR-102/team",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin_mgr102.status_code == 200
    data_102 = resp_admin_mgr102.json()
    assert data_102["manager_id"] == "MGR-102"
    assert data_102["direct_reports_count"] == 2

    # 3. Manager (even MGR-101 for MGR-101) receives 403 Forbidden on this admin route
    resp_mgr_blocked = client.get(
        "/api/admin/managers/MGR-101/team",
        headers={"Authorization": f"Bearer {mgr101_token}"}
    )
    assert resp_mgr_blocked.status_code == 403
    assert "Admin role required" in resp_mgr_blocked.json()["detail"]

    # 4. Employee receives 403 Forbidden
    resp_emp_blocked = client.get(
        "/api/admin/managers/MGR-101/team",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert resp_emp_blocked.status_code == 403
    assert "Admin role required" in resp_emp_blocked.json()["detail"]

    # 5. Unauthenticated receives 401 Unauthorized
    resp_unauth = client.get("/api/admin/managers/MGR-101/team")
    assert resp_unauth.status_code == 401

