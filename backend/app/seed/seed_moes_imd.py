import os
import sys

# Add backend directory to sys.path to resolve 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.employee import Employee
from app.models.department import Department
from app.models.capacity_connect import TrainerLibraryItem, Announcement
from app.models.assessment import Assessment

def seed_moes_imd():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("Starting MoES/IMD data seed...")

    # Departments / RMCs
    rmc_delhi = Department(id="DEPT-RMC-DELHI", name="Regional Meteorological Centre, Delhi")
    db.merge(rmc_delhi)

    # Personas
    admin_pw = get_password_hash("admin123")
    user_pw = get_password_hash("password123")

    # 1. Admin
    admin_user = Employee(
        id="EMP-ADMIN",
        name="Dr. M. Mohapatra",
        email="admin@imd.gov.in",
        hashed_password=admin_pw,
        role="admin",
        status="approved",
        role_title="Director General",
        department="Capacity Building Admin",
        department_id="DEPT-RMC-DELHI",
        is_admin=True
    )
    db.merge(admin_user)

    # 2. Approved Trainee
    trainee_approved = Employee(
        id="EMP-TRAINEE-1",
        name="Ramesh Kumar",
        email="ramesh@imd.gov.in",
        hashed_password=user_pw,
        role="trainee",
        status="approved",
        role_title="Scientific Assistant",
        department="MC Bhubaneswar",
        interests=["Doppler Weather Radar", "Cyclone Tracking"]
    )
    db.merge(trainee_approved)

    # 3. Pending Trainee
    trainee_pending = Employee(
        id="EMP-TRAINEE-2",
        name="Priya Verma",
        email="priya@imd.gov.in",
        hashed_password=user_pw,
        role="trainee",
        status="pending_approval",
        role_title="Meteorologist",
        department="MC Chennai"
    )
    db.merge(trainee_pending)

    # 4. Approved Trainer
    trainer_approved = Employee(
        id="EMP-TRAINER-1",
        name="Dr. S. K. Roy",
        email="roy@imd.gov.in",
        hashed_password=user_pw,
        role="trainer",
        status="approved",
        role_title="Scientist-E",
        department="CTI Pune",
        interests=["Numerical Weather Prediction", "Doppler Weather Radar"],
        qualifications=["Ph.D. Atmospheric Sciences", "DWR Operations Expert"],
        experience_years=15.0
    )
    db.merge(trainer_approved)
    db.commit()

    # Pre-Seeded Trainer Library
    lib_item = TrainerLibraryItem(
        id="LIB-1001",
        trainer_id="EMP-TRAINER-1",
        title="DWR Operations & Echo Interpretation",
        subject="Doppler Weather Radar",
        resource_type="recorded_lecture",
        description="Introduction to Doppler Weather Radar systems.",
        file_size_label="45MB"
    )
    db.merge(lib_item)

    # Pre-Seeded Announcement
    announcement = Announcement(
        id="ANN-1001",
        title="National Doppler Radar Training Session Live",
        category="announcement",
        content="Join Dr. Roy for a live session on DWR echo interpretation this Friday.",
        published_by="EMP-ADMIN"
    )
    db.merge(announcement)

    # Pre-seeded Assessment
    assessment = Assessment(
        id="ASM-1001",
        title="DWR Basics Questionnaire",
        category="Meteorology",
        description="Test your knowledge on Doppler Weather Radars.",
        trainer_id="EMP-TRAINER-1",
        deadline="2026-10-31T23:59:59Z",
        passing_score=75
    )
    db.merge(assessment)

    db.commit()
    print("MoES/IMD seed complete.")
    db.close()

if __name__ == "__main__":
    seed_moes_imd()

