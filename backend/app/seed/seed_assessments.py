"""Seed Script: Diagnostic Assessments and Question Bank

Seeds mockAssessments (asm1, asm2, asm3) and all detailed questions (q1..q6)
with scenarios, options, uncertainty options, rationales, and growth resources.
"""
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentOption

ASSESSMENTS = [
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
    },
    {
        "id": "asm2",
        "title": "Modern React Patterns & Performance Audit",
        "category": "Technical",
        "completedDate": "2026-08-28",
        "baselineLevel": "Solid Foundation (88%)",
        "status": "Baseline Established",
        "questionCount": 6,
        "targetRole": "Senior Cloud Applications Engineer",
        "description": "Evaluated state management, memoization strategies, and render cycle optimizations."
    },
    {
        "id": "asm3",
        "title": "Agile & Product Delivery Readiness",
        "category": "Process",
        "completedDate": "2026-08-10",
        "baselineLevel": "Exceeds Baseline (94%)",
        "status": "Baseline Established",
        "questionCount": 5,
        "targetRole": "Senior Cloud Applications Engineer",
        "description": "Mapped sprint cadence, async cross-functional communication, and PR velocity."
    }
]

QUESTIONS = [
    {
        "id": "q1",
        "assessment_id": "asm1",
        "topic": "Compute & Scalability",
        "competency": "Cloud Architecture (AWS/GCP)",
        "scenario": "Your e-commerce application experiences predictable morning spikes and unexpected flash sale surges.",
        "question": "Which architectural pattern provides automated scaling without over-provisioning static compute servers?",
        "options": [
            {"id": "q1-a", "text": "Configure an Auto Scaling Group with dynamic Target Tracking policies linked to average CPU utilization and request count", "is_correct": True},
            {"id": "q1-b", "text": "Permanently deploy the maximum anticipated number of EC2 instances with oversized memory", "is_correct": False},
            {"id": "q1-c", "text": "Execute a manual bash script at peak hours to restart virtual machines with larger CPU sizes", "is_correct": False},
            {"id": "q1-d", "text": "Direct all excess traffic to a static cache server while keeping the compute layer fixed", "is_correct": False},
            {"id": "q1-unsure", "text": "I'm not sure yet — haven't worked with auto-scaling policies yet", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q1-a",
        "rationale": "Target tracking scaling policies automatically adjust capacity in response to dynamic workload changes to maintain target performance.",
        "growthResource": {
            "title": "Designing Resilient Cloud Architecture with AWS",
            "type": "Hands-on Lab",
            "duration": "6.0 hrs"
        }
    },
    {
        "id": "q2",
        "assessment_id": "asm1",
        "topic": "Container Orchestration",
        "competency": "Docker & Container Orchestration",
        "scenario": "Developers report that an application functions seamlessly on macOS laptops but encounters runtime library collisions on Linux production hosts.",
        "question": "How does containerization with Docker eliminate this environment discrepancy?",
        "options": [
            {"id": "q2-a", "text": "By bundling application source code, runtime, system dependencies, and configurations into an immutable image sharing the host kernel", "is_correct": True},
            {"id": "q2-b", "text": "By installing a complete guest operating system and hypervisor inside every running process", "is_correct": False},
            {"id": "q2-c", "text": "By compiling JavaScript files directly into machine binary code prior to deployment", "is_correct": False},
            {"id": "q2-d", "text": "By replacing the physical router configuration on the host server network card", "is_correct": False},
            {"id": "q2-unsure", "text": "I'm not sure yet — still exploring container isolation principles", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q2-a",
        "rationale": "Docker packages code along with its exact binary dependencies into a standard image, guaranteeing uniform execution across all environments.",
        "growthResource": {
            "title": "Accelerate Docker & Kubernetes Deployment",
            "type": "Course",
            "duration": "4.5 hrs"
        }
    },
    {
        "id": "q3",
        "assessment_id": "asm1",
        "topic": "Infrastructure as Code",
        "competency": "Cloud Architecture (AWS/GCP)",
        "scenario": "Your team wants repeatable cloud environments across development, staging, and production without manual AWS console drift.",
        "question": "What is the primary architectural value of declarative Infrastructure as Code (e.g. Terraform, AWS CloudFormation)?",
        "options": [
            {"id": "q3-a", "text": "You specify the desired end-state of your cloud resources, and the engine calculates execution diffs and reconciles state automatically", "is_correct": True},
            {"id": "q3-b", "text": "You write procedural scripts with sleep timers to ensure each server boots before the next command", "is_correct": False},
            {"id": "q3-c", "text": "It bypasses cloud provider identity management by generating anonymous resources", "is_correct": False},
            {"id": "q3-d", "text": "It compiles backend code into microservices without requiring any database connections", "is_correct": False},
            {"id": "q3-unsure", "text": "I'm not sure yet — haven't authored declarative cloud infrastructure", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q3-a",
        "rationale": "Declarative IaC models let engineers define the target architecture, while the state engine figures out dependencies and resource lifecycle safely.",
        "growthResource": {
            "title": "Designing Resilient Cloud Architecture with AWS",
            "type": "Hands-on Lab",
            "duration": "6.0 hrs"
        }
    },
    {
        "id": "q4",
        "assessment_id": "asm1",
        "topic": "Microservice Resilience",
        "competency": "Node.js & Microservices",
        "scenario": "A downstream payment service begins taking 15 seconds to reply, causing connection pool exhaustion across upstream client microservices.",
        "question": "Which design pattern stops cascaded system outages by rapidly returning a fallback response when downstream calls repeatedly fail?",
        "options": [
            {"id": "q4-a", "text": "Circuit Breaker pattern with configured failure thresholds and half-open test intervals", "is_correct": True},
            {"id": "q4-b", "text": "Exponential Retry Loop without backoff or delay limits", "is_correct": False},
            {"id": "q4-c", "text": "Synchronous Blocking Polling loop on the main thread", "is_correct": False},
            {"id": "q4-d", "text": "Shared in-memory global state variable across all workers", "is_correct": False},
            {"id": "q4-unsure", "text": "I'm not sure yet — haven't implemented distributed circuit breakers", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q4-a",
        "rationale": "Circuit breakers trip immediately after consecutive failures, shielding upstream servers from thread exhaustion and letting struggling services recover.",
        "growthResource": {
            "title": "Advanced Microservices Communication & Messaging",
            "type": "Workshop",
            "duration": "3.0 hrs"
        }
    },
    {
        "id": "q5",
        "assessment_id": "asm1",
        "topic": "Multi-Region High Availability",
        "competency": "System Design & Scalability",
        "scenario": "A financial reporting service requires zero downtime and an RTO of under 5 minutes during an entire primary AWS Region power disruption.",
        "question": "Which data tier strategy provides sub-minute failover across geographic boundaries?",
        "options": [
            {"id": "q5-a", "text": "Cross-Region Active-Active database clustering with asynchronous multi-master replication and DNS latency-based routing", "is_correct": True},
            {"id": "q5-b", "text": "Nightly manual CSV export uploaded to Google Drive folder", "is_correct": False},
            {"id": "q5-c", "text": "Single AZ MySQL instance on EC2 with periodic snapshot creation", "is_correct": False},
            {"id": "q5-d", "text": "Relying on physical hard drives transported via courier service", "is_correct": False},
            {"id": "q5-unsure", "text": "I'm not sure yet — still studying multi-region replication architectures", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q5-a",
        "rationale": "Cross-region active-active clusters pair continuous background sync with latency DNS to provide seamless regional disaster recovery.",
        "growthResource": {
            "title": "Designing Resilient Cloud Architecture with AWS",
            "type": "Hands-on Lab",
            "duration": "6.0 hrs"
        }
    },
    {
        "id": "q6",
        "assessment_id": "asm1",
        "topic": "Cost Optimization & Storage Tiers",
        "competency": "Cloud Architecture (AWS/GCP)",
        "scenario": "Your analytics platform stores 100TB of log archives that are strictly required for regulatory compliance once per year but rarely accessed.",
        "question": "Which storage tier strategy minimizes cost while preserving automated retrieval options?",
        "options": [
            {"id": "q6-a", "text": "Transitioning logs to Amazon S3 Glacier Flexible Retrieval or Deep Archive via automated bucket Lifecycle Rules", "is_correct": True},
            {"id": "q6-b", "text": "Storing all 100TB on provisioned IOPS SSD EBS volumes attached to idle EC2 instances", "is_correct": False},
            {"id": "q6-c", "text": "Converting all logs to individual in-memory Redis cache keys", "is_correct": False},
            {"id": "q6-d", "text": "Printing logs onto paper rolls for archival storage", "is_correct": False},
            {"id": "q6-unsure", "text": "I'm not sure yet — haven't configured cloud storage lifecycle tiers", "is_correct": False, "is_uncertainty": True}
        ],
        "correctOptionId": "q6-a",
        "rationale": "S3 Lifecycle policies automate tiered transitions from high-frequency hot storage to ultra low-cost cold archive storage seamlessly.",
        "growthResource": {
            "title": "Designing Resilient Cloud Architecture with AWS",
            "type": "Hands-on Lab",
            "duration": "6.0 hrs"
        }
    }
]


def seed_assessments_and_questions(db: Session) -> None:
    # 1. Seed Assessments
    for a in ASSESSMENTS:
        existing = db.query(Assessment).filter(Assessment.id == a["id"]).first()
        if not existing:
            db.add(Assessment(
                id=a["id"],
                title=a["title"],
                category=a["category"],
                due_date=a.get("dueDate"),
                completed_date=a.get("completedDate"),
                estimated_minutes=a.get("estimatedMinutes", 15),
                status=a.get("status", "Ready for Baseline Discovery"),
                question_count=a.get("questionCount", 6),
                target_role=a.get("targetRole", "Senior Cloud Applications Engineer"),
                description=a.get("description", ""),
                baseline_level=a.get("baselineLevel")
            ))
    db.commit()

    # 2. Seed Questions & Options
    for q in QUESTIONS:
        existing_q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == q["id"]).first()
        if not existing_q:
            q_row = AssessmentQuestion(
                id=q["id"],
                assessment_id=q["assessment_id"],
                topic=q["topic"],
                competency=q["competency"],
                scenario=q["scenario"],
                question_text=q["question"],
                correct_option_id=q["correctOptionId"],
                rationale=q.get("rationale"),
                growth_resource=q.get("growthResource")
            )
            db.add(q_row)
            db.commit()

            for opt in q["options"]:
                opt_row = AssessmentOption(
                    id=opt["id"],
                    question_id=q["id"],
                    text=opt["text"],
                    is_correct=opt.get("is_correct", False),
                    is_uncertainty_option=opt.get("is_uncertainty", False)
                )
                db.add(opt_row)
            db.commit()
