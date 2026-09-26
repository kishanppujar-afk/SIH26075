from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.learning_resource import LearningResource
from app.schemas.course import LearningResourceResponse
from app.ai.embeddings import OllamaSemanticMatcher
from app.integrations.nssta_data import OFFICIAL_CATALOG

router = APIRouter(prefix="/learning-resources", tags=["Learning Resources (NSSTA / MoSPI)"])
matcher = OllamaSemanticMatcher()


@router.get("", response_model=List[LearningResourceResponse])
def get_learning_resources(
    query: Optional[str] = Query(None, description="Search term across title, topics, or keywords"),
    source: Optional[str] = Query(None, description="Filter by source: NSSTA, MoSPI, or iGOT"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns authentic training resources from the verified NSSTA/MoSPI catalogue.
    """
    db_query = db.query(LearningResource)
    if source:
        db_query = db_query.filter(LearningResource.source == source)
    
    resources = db_query.all()

    if not resources:
        # Fallback to in-memory catalogue if DB has not yet been seeded
        resources = [
            LearningResource(
                id=f"res-{i}",
                title=item["title"],
                description=item["description"],
                source=item["source"],
                url=item["url"],
                keywords=item.get("keywords", []),
                topics=item.get("topics", []),
                related_skills=item.get("relatedSkills", [])
            )
            for i, item in enumerate(OFFICIAL_CATALOG)
        ]

    # In-memory filter for query if provided
    if query:
        q_lower = query.lower()
        filtered = []
        for r in resources:
            title_match = q_lower in r.title.lower()
            desc_match = q_lower in r.description.lower()
            topic_match = any(q_lower in t.lower() for t in (r.topics or []))
            skill_match = any(q_lower in s.lower() for s in (r.related_skills or []))
            keyword_match = any(q_lower in k.lower() for k in (r.keywords or []))
            if title_match or desc_match or topic_match or skill_match or keyword_match:
                filtered.append(r)
        resources = filtered

    return [
        LearningResourceResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            source=r.source,
            url=r.url,
            keywords=r.keywords or [],
            topics=r.topics or [],
            relatedSkills=r.related_skills or [],
            resource_type=r.resource_type or "Course",
            duration_label=r.duration_label or "Self-paced"
        )
        for r in resources[:limit]
    ]


@router.get("/{resource_id}", response_model=LearningResourceResponse)
def get_resource_by_id(resource_id: str, db: Session = Depends(get_db)):
    res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not res:
        # Check by title index or prefix
        for i, item in enumerate(OFFICIAL_CATALOG):
            if f"res-{i}" == resource_id or item["title"] == resource_id:
                return LearningResourceResponse(
                    id=resource_id,
                    title=item["title"],
                    description=item["description"],
                    source=item["source"],
                    url=item["url"],
                    keywords=item.get("keywords", []),
                    topics=item.get("topics", []),
                    relatedSkills=item.get("relatedSkills", []),
                    resource_type="Course",
                    duration_label="Self-paced"
                )
        raise HTTPException(status_code=404, detail="Learning resource not found.")

    return LearningResourceResponse(
        id=res.id,
        title=res.title,
        description=res.description,
        source=res.source,
        url=res.url,
        keywords=res.keywords or [],
        topics=res.topics or [],
        relatedSkills=res.related_skills or [],
        resource_type=res.resource_type or "Course",
        duration_label=res.duration_label or "Self-paced"
    )


@router.post("/search")
async def search_resources_semantic(
    query: str = Query(..., description="Natural language search query or competency topic"),
    top_k: int = Query(5, ge=1, le=20)
):
    """
    Hybrid semantic vector + lexical search across NSSTA/MoSPI training modules
    using local nomic-embed-text embeddings.
    """
    matched = await matcher.match_resources(query, OFFICIAL_CATALOG, top_k=top_k)
    return {
        "query": query,
        "results_count": len(matched),
        "results": matched
    }
