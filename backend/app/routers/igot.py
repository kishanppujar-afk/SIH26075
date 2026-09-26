from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.integrations.igot_adapter import igot_adapter

router = APIRouter(prefix="/igot", tags=["iGOT Karmayogi Adapter (Isolated)"])


@router.get("/status")
def get_igot_status():
    """
    Returns current telemetry of the isolated iGOT Karmayogi adapter interface.
    Cleanly marked as 'pending_official_access' with no fabricated production calls.
    """
    return igot_adapter.get_status()


@router.get("/courses")
def get_igot_courses(query: Optional[str] = Query(None)):
    """
    Simulated gateway method: raises clean NotImplementedError explaining that official
    access is pending, preserving the exact architecture for future integration.
    """
    try:
        return igot_adapter.get_course_catalogue(query=query)
    except NotImplementedError as e:
        return {
            "status": "pending_official_access",
            "message": str(e),
            "adapter": "iGOT Karmayogi Adapter",
            "available_local_sources": ["NSSTA (53 programmes)", "MoSPI"]
        }
