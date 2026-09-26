"""Seed Script: Competency Domains and Skills

Seeds the four core competency domains of the Indian Official Statistical System
along with existing frontend mockSkills (s1..s6) and domain-specific competencies.
"""
from sqlalchemy.orm import Session
from app.models.competency import CompetencyDomain, Skill

DOMAINS = [
    {
        "id": "dom-statistical",
        "name": "Statistical",
        "description": "Core statistical methods, survey methodologies, national accounts, and data quality standards."
    },
    {
        "id": "dom-technical",
        "name": "Technical",
        "description": "Software architecture, modern programming languages, cloud systems, and data pipelines."
    },
    {
        "id": "dom-digital-gov",
        "name": "Digital Governance",
        "description": "Digital Public Infrastructure (DPI), open data governance, cybersecurity, and digital signatures."
    },
    {
        "id": "dom-behavioural",
        "name": "Behavioural-Managerial",
        "description": "Public leadership, inter-departmental communication, ethics, project execution, and decision making."
    }
]

# Skills combining existing mockSkills (s1..s6) and statistical system requirements
INITIAL_SKILLS = [
    # Existing mockSkills with exact IDs
    {
        "id": "s1",
        "name": "React & Modern Frontend",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Component architecture, React hooks, state management, and modern UI engineering."
    },
    {
        "id": "s2",
        "name": "Cloud Architecture (AWS/GCP)",
        "domain_id": "dom-technical",
        "category": "Cloud & DevOps",
        "description": "Cloud infrastructure, compute scaling, VPC networking, and resilient architecture design."
    },
    {
        "id": "s3",
        "name": "Node.js & Microservices",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Asynchronous backend runtimes, RESTful APIs, and distributed service communication."
    },
    {
        "id": "s4",
        "name": "Docker & Container Orchestration",
        "domain_id": "dom-technical",
        "category": "Cloud & DevOps",
        "description": "Container image lifecycle, Dockerfiles, multi-stage builds, and container orchestration."
    },
    {
        "id": "s5",
        "name": "System Design & Scalability",
        "domain_id": "dom-technical",
        "category": "Architecture",
        "description": "Distributed data stores, load balancing, caching strategies, and system resilience."
    },
    {
        "id": "s6",
        "name": "Cross-Functional Collaboration",
        "domain_id": "dom-behavioural",
        "category": "Soft Skills",
        "description": "Stakeholder management, async alignment, technical communication, and team mentorship."
    },

    # Statistical Domain Competencies
    {
        "id": "skill-survey-design",
        "name": "Survey Design",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Questionnaire design, pilot testing, and survey instrument formulation for official surveys."
    },
    {
        "id": "skill-sampling",
        "name": "Sampling Techniques",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Stratified, multi-stage, and cluster sampling methodologies used in NSS and national statistics."
    },
    {
        "id": "skill-national-accounts",
        "name": "National Accounts & GDP",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "System of National Accounts (SNA), Gross Value Added (GVA), and macroeconomic aggregates."
    },
    {
        "id": "skill-price-stats",
        "name": "Price Statistics & Index Numbers",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Consumer Price Index (CPI), Wholesale Price Index (WPI), Laspeyres/Paasche index computation."
    },
    {
        "id": "skill-labour-stats",
        "name": "Labour & Employment Statistics",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Periodic Labour Force Survey (PLFS) data extraction, activity status metrics, and analysis."
    },
    {
        "id": "skill-agri-stats",
        "name": "Agricultural Statistics",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Crop estimation surveys, agricultural census methodologies, and rural statistics."
    },
    {
        "id": "skill-sdg-indicators",
        "name": "SDG National Indicator Framework",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "Monitoring and reporting metadata for the Sustainable Development Goals (SDG) NIF."
    },
    {
        "id": "skill-data-quality",
        "name": "Metadata Standards & Data Quality",
        "domain_id": "dom-statistical",
        "category": "Statistical",
        "description": "National Quality Assurance Framework (NQAF), DDI, SDMX, and unit data validation."
    },

    # Technical & Statistical Software Competencies
    {
        "id": "skill-python",
        "name": "Python for Data Science",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Pandas, NumPy, Scikit-Learn, data wrangling, and unit-level microdata analysis."
    },
    {
        "id": "skill-r",
        "name": "R Programming & Statistics",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Survey analysis, tidyverse, sampling weights, and statistical modeling in R."
    },
    {
        "id": "skill-sql",
        "name": "SQL & Relational Databases",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Complex queries, window functions, relational schemas, and query optimization."
    },
    {
        "id": "skill-stata",
        "name": "Stata / SPSS / SAS Analysis",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Econometric modeling, cross-tabulation, survey weight expansion, and regression analysis."
    },
    {
        "id": "skill-gis",
        "name": "GIS & Spatial Analytics",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Geospatial mapping, census boundary shapefiles, QGIS, and spatial disaggregation."
    },
    {
        "id": "skill-dataviz",
        "name": "Data Visualization & Dashboards",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Interactive official dashboards, visual storytelling, and statistical charting standards."
    },
    {
        "id": "skill-ai-ml",
        "name": "AI/ML in Official Statistics",
        "domain_id": "dom-technical",
        "category": "Technical",
        "description": "Automated data classification, imputation, NLP for survey texts, and satellite imagery analysis."
    },

    # Digital Governance Competencies
    {
        "id": "skill-dpi",
        "name": "Digital Public Infrastructure (DPI)",
        "domain_id": "dom-digital-gov",
        "category": "Digital Governance",
        "description": "India Stack, Aadhaar, UPI, DigiLocker, and API Setu integration principles."
    },
    {
        "id": "skill-cybersecurity",
        "name": "Cybersecurity & Data Privacy",
        "domain_id": "dom-digital-gov",
        "category": "Digital Governance",
        "description": "Digital Personal Data Protection (DPDP) Act, encryption, and secure unit data storage."
    },
    {
        "id": "skill-open-data",
        "name": "Open Data & APIs",
        "domain_id": "dom-digital-gov",
        "category": "Digital Governance",
        "description": "Open government data portals (data.gov.in), API-first data dissemination, and metadata publishing."
    },

    # Behavioural & Managerial Competencies
    {
        "id": "skill-leadership",
        "name": "Leadership & Change Management",
        "domain_id": "dom-behavioural",
        "category": "Behavioural-Managerial",
        "description": "Public administrative leadership, digital transformation adoption, and strategic planning."
    },
    {
        "id": "skill-ethics",
        "name": "Ethics & Integrity in Statistics",
        "domain_id": "dom-behavioural",
        "category": "Behavioural-Managerial",
        "description": "Fundamental Principles of Official Statistics, confidentiality, objectivity, and impartiality."
    }
]


def seed_skills_and_domains(db: Session) -> None:
    # 1. Seed Domains
    for d in DOMAINS:
        existing = db.query(CompetencyDomain).filter(CompetencyDomain.id == d["id"]).first()
        if not existing:
            db.add(CompetencyDomain(id=d["id"], name=d["name"], description=d["description"]))
    db.commit()

    # 2. Seed Skills
    for s in INITIAL_SKILLS:
        existing = db.query(Skill).filter(Skill.id == s["id"]).first()
        if not existing:
            db.add(Skill(
                id=s["id"],
                name=s["name"],
                domain_id=s["domain_id"],
                category=s["category"],
                description=s["description"]
            ))
    db.commit()
