import pytest
from app.services.gap_analysis_service import (
    compute_skill_gap,
    match_resources_heuristic,
    match_resources_for_skill
)
from app.integrations.nssta_data import OFFICIAL_CATALOG


def test_compute_skill_gap():
    # Gap > 10: isOpportunity True, isExceeds False
    res1 = compute_skill_gap(current_score=55, target_score=80)
    assert res1["gap"] == 25
    assert res1["isOpportunity"] is True
    assert res1["isExceeds"] is False

    # Gap 0: isOpportunity False, isExceeds True
    res2 = compute_skill_gap(current_score=92, target_score=85)
    assert res2["gap"] == 0
    assert res2["isOpportunity"] is False
    assert res2["isExceeds"] is True


def test_match_resources_heuristic():
    assert len(OFFICIAL_CATALOG) > 0

    # Test matching for Docker / Container Orchestration
    matches_docker = match_resources_heuristic(
        skill_name="Docker & Container Orchestration",
        category="Cloud & DevOps",
        catalog=OFFICIAL_CATALOG,
        top_k=3
    )
    assert len(matches_docker) > 0
    # Should contain relevant titles with high heuristic scores
    assert "title" in matches_docker[0]
    assert "url" in matches_docker[0]
    assert matches_docker[0]["source"] in ["NSSTA", "MoSPI"]

    # Test matching for Official Statistics / Sampling
    matches_sampling = match_resources_heuristic(
        skill_name="Sampling Techniques",
        category="Statistical",
        catalog=OFFICIAL_CATALOG,
        top_k=3
    )
    assert len(matches_sampling) > 0
    assert any("sampling" in m["title"].lower() or "survey" in m["title"].lower() or "statistical" in m["title"].lower() for m in matches_sampling)


@pytest.mark.asyncio
async def test_match_resources_for_skill_async():
    results = await match_resources_for_skill(
        skill_name="Cloud Architecture (AWS/GCP)",
        category="Cloud & DevOps",
        catalog=OFFICIAL_CATALOG,
        top_k=2
    )
    assert len(results) == 2
    assert "title" in results[0]
    assert "url" in results[0]
