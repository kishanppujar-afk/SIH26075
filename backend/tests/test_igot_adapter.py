import pytest
from app.integrations.igot_adapter import igot_adapter, IGotAdapter


def test_igot_adapter_status():
    status = igot_adapter.get_status()
    assert status["status"] == "pending_official_access"
    assert "pending official access" in status["message"].lower() or "pending official government credentials" in status["message"].lower()


def test_igot_adapter_raises_not_implemented():
    with pytest.raises(NotImplementedError) as exc_info:
        igot_adapter.get_course_catalogue()
    assert "pending official API access" in str(exc_info.value)

    with pytest.raises(NotImplementedError):
        igot_adapter.get_course_details("dummy-course-123")

    with pytest.raises(NotImplementedError):
        igot_adapter.enroll_employee("EMP-2048", "course-123")

    with pytest.raises(NotImplementedError):
        igot_adapter.recommend_courses("EMP-2048", [])
