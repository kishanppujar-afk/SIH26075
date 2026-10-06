import pytest
from app.core.security import decode_access_token


def test_login_returns_correct_role_and_jwt_claims(client):
    # 1. Admin login
    admin_login = client.post("/api/auth/login", json={
        "email_or_id": "admin@mospi.gov.in",
        "password": "AdminPass123!"
    })
    assert admin_login.status_code == 200
    admin_data = admin_login.json()
    assert admin_data["role"] == "admin"
    admin_token = admin_data["access_token"]
    admin_payload = decode_access_token(admin_token)
    assert admin_payload["role"] == "admin"
    assert admin_payload["sub"] == "ADM-001"

    # 2. Manager login
    mgr_login = client.post("/api/auth/login", json={
        "email_or_id": "pooja.sengupta@mospi.gov.in",
        "password": "ManagerPass123!"
    })
    assert mgr_login.status_code == 200
    mgr_data = mgr_login.json()
    assert mgr_data["role"] == "manager"
    mgr_token = mgr_data["access_token"]
    mgr_payload = decode_access_token(mgr_token)
    assert mgr_payload["role"] == "manager"
    assert mgr_payload["sub"] == "MGR-101"
    assert mgr_payload["department_id"] == "labour-statistics"

    # 3. Employee login with email
    emp_login = client.post("/api/auth/login", json={
        "email_or_id": "aarav.sharma@mospi.gov.in",
        "password": "password123"
    })
    assert emp_login.status_code == 200
    emp_data = emp_login.json()
    assert emp_data["role"] == "employee"
    emp_token = emp_data["access_token"]
    emp_payload = decode_access_token(emp_token)
    assert emp_payload["role"] == "employee"
    assert emp_payload["sub"] == "EMP-2048"

    # 4. Employee login with employee ID
    emp2_login = client.post("/api/auth/login", json={
        "email_or_id": "EMP-2051",
        "password": "Password123!"
    })
    assert emp2_login.status_code == 200
    emp2_data = emp2_login.json()
    assert emp2_data["role"] == "employee"
    assert emp2_data["employee"]["name"] == "Vikram Joshi"


def test_get_me_returns_distinct_user_data_multi_user(client):
    """
    Explicitly tests that different logged-in accounts receive THEIR OWN
    distinct data and that no fallback to EMP-2048 occurs.
    """
    # Login as User A: EMP-2048 (Aarav Sharma - Labour Statistics)
    token_a = client.post("/api/auth/login", json={
        "email_or_id": "EMP-2048",
        "password": "password123"
    }).json()["access_token"]

    # Login as User B: EMP-2051 (Vikram Joshi - Price Statistics)
    token_b = client.post("/api/auth/login", json={
        "email_or_id": "EMP-2051",
        "password": "Password123!"
    }).json()["access_token"]

    # Login as User C: EMP-2053 (Divya Menon - National Accounts)
    token_c = client.post("/api/auth/login", json={
        "email_or_id": "EMP-2053",
        "password": "Password123!"
    }).json()["access_token"]

    # Query /api/auth/me for User A
    me_a = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert me_a["id"] == "EMP-2048"
    assert me_a["name"] == "Aarav Sharma"
    assert me_a["role"] == "employee"
    assert me_a["department_id"] == "labour-statistics"

    # Query /api/auth/me for User B
    me_b = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert me_b["id"] == "EMP-2051"
    assert me_b["name"] == "Vikram Joshi"
    assert me_b["role"] == "employee"
    assert me_b["department_id"] == "price-statistics"

    # Query /api/auth/me for User C
    me_c = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_c}"}).json()
    assert me_c["id"] == "EMP-2053"
    assert me_c["name"] == "Divya Menon"
    assert me_c["role"] == "employee"
    assert me_c["department_id"] == "national-accounts"

    # Query /api/employees/me for User A vs User B vs User C
    emp_me_a = client.get("/api/employees/me", headers={"Authorization": f"Bearer {token_a}"}).json()
    emp_me_b = client.get("/api/employees/me", headers={"Authorization": f"Bearer {token_b}"}).json()
    emp_me_c = client.get("/api/employees/me", headers={"Authorization": f"Bearer {token_c}"}).json()

    assert emp_me_a["id"] == "EMP-2048"
    assert emp_me_b["id"] == "EMP-2051"
    assert emp_me_c["id"] == "EMP-2053"

    assert emp_me_a["readinessScore"] != emp_me_b["readinessScore"]
    assert emp_me_b["readinessScore"] != emp_me_c["readinessScore"]
    assert emp_me_a["department_id"] != emp_me_b["department_id"]


def test_invalid_token_does_not_silently_fallback(client):
    """
    Verifies that requests with an invalid Bearer token return 401 Unauthorized
    rather than silently falling back to EMP-2048.
    """
    resp = client.get("/api/employees/me", headers={"Authorization": "Bearer invalid_malformed_token"})
    assert resp.status_code == 401
    assert "Invalid or expired" in resp.json()["detail"]

    resp_auth = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.jwt.token"})
    assert resp_auth.status_code == 401


def test_departments_and_manager_hierarchy(db_session):
    from app.models.department import Department
    from app.models.employee import Employee

    # 1. Departments table contains the 4 required departments
    depts = db_session.query(Department).all()
    dept_names = {d.name for d in depts}
    expected_depts = {"Labour Statistics", "Price Statistics", "National Accounts", "Survey Design"}
    assert expected_depts.issubset(dept_names)

    # 2. Managers assigned to departments
    mgr1 = db_session.query(Employee).filter(Employee.id == "MGR-101").first()
    assert mgr1 is not None
    assert mgr1.role == "manager"
    assert mgr1.department_id == "labour-statistics"

    mgr2 = db_session.query(Employee).filter(Employee.id == "MGR-102").first()
    assert mgr2 is not None
    assert mgr2.role == "manager"
    assert mgr2.department_id == "price-statistics"

    # 3. Direct reports hierarchy
    reports_m1 = db_session.query(Employee).filter(Employee.manager_id == "MGR-101").all()
    report_ids = [r.id for r in reports_m1]
    assert "EMP-2048" in report_ids
    assert "EMP-2049" in report_ids
    assert "EMP-2050" in report_ids


def test_passwords_are_bcrypt_hashed(db_session):
    from app.models.employee import Employee
    employees = db_session.query(Employee).all()
    assert len(employees) >= 10
    for emp in employees:
        assert emp.hashed_password.startswith("$2b$")
        assert not emp.hashed_password.startswith("password")
        assert not emp.hashed_password.startswith("Pass")
