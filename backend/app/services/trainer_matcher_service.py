import json
from sqlalchemy.orm import Session
from app.models.employee import Employee

def match_trainers(db: Session, subject: str):
    """
    Algorithmic Competency Mapping Engine
    Formula: Suitability Score = (0.35 * C_match) + (0.25 * E_score) + (0.20 * R_hist) + (0.20 * V_sim)
    """
    trainers = db.query(Employee).filter(Employee.role == "trainer", Employee.status == "approved").all()
    results = []

    for trainer in trainers:
        # Mock calculation based on interests and qualifications
        # In a real scenario, this would use vector search on qualifications or NLP on subjects
        
        c_match = 0
        interests = trainer.interests or []
        qualifications = trainer.qualifications or []
        
        subject_lower = subject.lower()
        
        if any(subject_lower in str(i).lower() for i in interests):
            c_match += 50
        if any(subject_lower in str(q).lower() for q in qualifications):
            c_match += 50
            
        e_score = trainer.experience_years * 10
        if e_score > 100: e_score = 100
        
        r_hist = trainer.readiness_score or 50
        v_sim = 80 # default simulated value for now
        
        suitability_score = (0.35 * c_match) + (0.25 * e_score) + (0.20 * r_hist) + (0.20 * v_sim)
        
        results.append({
            "trainer_id": trainer.id,
            "trainer_name": trainer.name,
            "suitability_score": round(suitability_score, 2),
            "breakdown": {
                "c_match": c_match,
                "e_score": e_score,
                "r_hist": r_hist,
                "v_sim": v_sim
            }
        })

    # Rank results descending
    results.sort(key=lambda x: x["suitability_score"], reverse=True)
    return results
