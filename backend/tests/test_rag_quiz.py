import pytest
from app.services.rag_service import split_into_chunks, select_spread_chunks
from app.ai.fallback import FallbackMCQGenerator
from app.models.assessment import Assessment, AssessmentAttempt, AssessmentResult
from app.models.competency import EmployeeSkillScore
from app.models.material_quiz import UploadedMaterial, MaterialChunk, GeneratedQuiz, GeneratedQuizQuestion


def test_split_into_chunks():
    short_text = "This is a short paragraph.\n\nAnother short paragraph."
    chunks = split_into_chunks(short_text, target_words=50)
    assert len(chunks) == 1
    assert "Another short paragraph" in chunks[0]

    # Test multi-section splitting
    sections = [f"SECTION {i}: " + ("word " * 100) for i in range(5)]
    multi_text = "\n\n".join(sections)
    chunks_multi = split_into_chunks(multi_text, target_words=100)
    assert len(chunks_multi) >= 3


def test_select_spread_chunks():
    sample_chunks = [f"chunk_{i}" for i in range(10)]
    selected = select_spread_chunks(sample_chunks, num_questions=3)
    assert len(selected) == 3
    # Beginning, middle, end
    assert selected[0] == "chunk_0"
    assert selected[-1] == "chunk_9"
    assert selected[1] == "chunk_5" or selected[1] == "chunk_4"


@pytest.mark.asyncio
async def test_fallback_mcq_generator_single_chunk():
    generator = FallbackMCQGenerator()
    chunk_text = "The Ministry of Statistics implements Horvitz-Thompson estimators for stratified survey data."
    res = await generator.generate_single_mcq_from_chunk(chunk_text, topic="Survey Methodology")
    assert res is not None
    mcq = res["question"]
    assert "Horvitz-Thompson" in mcq["question_text"] or "Survey Methodology" in mcq["question_text"]
    assert len(mcq["options"]) == 4
    assert 0 <= mcq["correct_option_index"] <= 3
    assert mcq["source_snippet"] is not None
    assert len(mcq["source_snippet"]) > 0


def test_practice_assessment_never_mutates_employee_scores(client, db_session):
    # 1. Create a practice assessment
    asm_id = "asm-quiz-test-practice-1"
    asm = Assessment(
        id=asm_id,
        title="Practice Quiz Test",
        category="Practice & Reference",
        status="Available",
        question_count=1,
        target_role="Statistician",
        description="Testing score isolation",
        is_practice=True
    )
    db_session.add(asm)
    db_session.commit()

    # 2. Login as employee
    login_resp = client.post("/api/auth/login", json={
        "email_or_id": "aarav.sharma@mospi.gov.in",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Record baseline employee profile
    profile_before = client.get("/api/employees/me", headers=headers).json()
    readiness_before = profile_before.get("readinessScore")
    skill_index_before = profile_before.get("skillIndex")
    assert readiness_before is not None
    assert skill_index_before is not None

    scores_before = db_session.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == "EMP-2048"
    ).all()
    score_map_before = {s.skill_id: s.current_score for s in scores_before}

    # 3. Start attempt
    start_resp = client.post(f"/api/assessments/{asm_id}/attempts", headers=headers)
    assert start_resp.status_code == 200
    attempt_id = start_resp.json()["attempt_id"]

    # 4. Submit attempt
    submit_resp = client.post(f"/api/attempts/{attempt_id}/submit", headers=headers)
    assert submit_resp.status_code == 200

    # 5. Verify employee official scores did not mutate
    profile_after = client.get("/api/employees/me", headers=headers).json()
    assert profile_after.get("readinessScore") == readiness_before
    assert profile_after.get("skillIndex") == skill_index_before

    scores_after = db_session.query(EmployeeSkillScore).filter(
        EmployeeSkillScore.employee_id == "EMP-2048"
    ).all()
    score_map_after = {s.skill_id: s.current_score for s in scores_after}
    assert score_map_before == score_map_after


@pytest.mark.asyncio
async def test_repeated_chunk_selection_produces_distinct_questions():
    generator = FallbackMCQGenerator()
    chunk_text = (
        "Stratification optimizes the precision of socio-demographic indicators. "
        "The first stage units correspond to census villages in rural domains. "
        "Validation rules detect impossible demographic combinations before submission."
    )
    res1 = await generator.generate_single_mcq_from_chunk(chunk_text, topic="Sampling", focus_angle=None, avoid_questions=[])
    q1 = res1["question"]

    res2 = await generator.generate_single_mcq_from_chunk(
        chunk_text,
        topic="Sampling",
        focus_angle="validation checks",
        avoid_questions=[q1["question_text"]]
    )
    q2 = res2["question"]

    # Must be distinct questions with distinct source snippets
    assert q1["question_text"] != q2["question_text"]
    assert q1["source_snippet"] != q2["source_snippet"]
