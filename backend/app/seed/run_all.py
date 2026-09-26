"""Master Seed Execution Script

Initializes tables and executes all seed modules in proper dependency order:
1. Domains & Skills
2. Official NSSTA / MoSPI Catalogue (53 authentic items)
3. Diagnostic Assessments & Question Bank (asm1..asm3, q1..q6)
4. Demo Employee Aarav Sharma (EMP-2048) with scores, history, recommendations, insights
"""
import sys
import logging
from app.core.database import SessionLocal, engine, Base
import app.models  # Register all models with Base
from app.seed.seed_skills_domains import seed_skills_and_domains
from app.seed.seed_learning_resources import seed_learning_resources
from app.seed.seed_assessments import seed_assessments_and_questions
from app.seed.seed_demo_employee import seed_demo_employee

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def run_all_seeds():
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        logger.info("1/4 Seeding Competency Domains and Skills...")
        seed_skills_and_domains(db)

        logger.info("2/4 Seeding Official NSSTA & MoSPI Training Catalog...")
        res_count = seed_learning_resources(db)
        logger.info(f"    Seeded {res_count} training resources.")

        logger.info("3/4 Seeding Diagnostic Assessments and Questions...")
        seed_assessments_and_questions(db)

        logger.info("4/4 Seeding Demo Employee Aarav Sharma (EMP-2048)...")
        seed_demo_employee(db)

        logger.info("All seed modules executed successfully!")
    except Exception as e:
        logger.error(f"Error during seeding: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_all_seeds()
