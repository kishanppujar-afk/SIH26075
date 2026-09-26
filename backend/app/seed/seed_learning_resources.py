"""Seed Script: NSSTA / MoSPI Official Training Catalogue

Seeds the verified 53 training programmes, syllabi, and publications
strictly extracted from src/mock/employeeData.js into the LearningResource table.
"""
from sqlalchemy.orm import Session
from app.models.learning_resource import LearningResource
from app.integrations.nssta_data import OFFICIAL_CATALOG


def seed_learning_resources(db: Session) -> int:
    count = 0
    for i, item in enumerate(OFFICIAL_CATALOG):
        res_id = f"res-official-{i+1}"
        existing = db.query(LearningResource).filter(
            (LearningResource.id == res_id) | (LearningResource.title == item["title"])
        ).first()

        if not existing:
            resource = LearningResource(
                id=res_id,
                title=item["title"],
                description=item["description"],
                source=item.get("source", "NSSTA"),
                url=item["url"],
                resource_type="Course" if "Course" in item["title"] or "Training" in item["title"] else "Publication",
                duration_label="Self-paced" if "Calendar" not in item["title"] else "Annual",
                keywords=item.get("keywords", []),
                topics=item.get("topics", []),
                related_skills=item.get("relatedSkills", [])
            )
            db.add(resource)
            count += 1

    db.commit()
    return count
