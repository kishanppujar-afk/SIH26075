import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, get_db
from app.main import app
from app.seed.seed_skills_domains import seed_skills_and_domains
from app.seed.seed_learning_resources import seed_learning_resources
from app.seed.seed_assessments import seed_assessments_and_questions
from app.seed.seed_demo_employee import seed_demo_employee

TEST_DB_URL = "sqlite:///./test_skillstat.db"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_skills_and_domains(db)
    seed_learning_resources(db)
    seed_assessments_and_questions(db)
    seed_demo_employee(db)
    
    # Set all employees to approved for tests to pass
    from app.models.employee import Employee
    db.query(Employee).update({"status": "approved"})
    db.commit()
    
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_skillstat.db"):
        try:
            os.remove("./test_skillstat.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
