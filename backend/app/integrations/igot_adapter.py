"""iGOT Karmayogi Integration Adapter (Isolated Interface)

IMPORTANT:
Real iGOT API credentials and endpoints are not yet available.
This module defines the clean, isolated integration interface for future integration.
Methods raise NotImplementedError("iGOT integration pending official API access") or
return structured 'pending' metadata. No speculative endpoints or unverified auth flows
are implemented.
"""
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod


class IGotAdapterInterface(ABC):
    """Clean abstract boundary for iGOT Karmayogi integration."""

    @abstractmethod
    def get_course_catalogue(self, query: Optional[str] = None, page: int = 1, page_size: int = 20) -> List[Dict[str, Any]]:
        """Fetch course catalogue from iGOT Karmayogi."""
        pass

    @abstractmethod
    def get_course_details(self, course_id: str) -> Dict[str, Any]:
        """Fetch detailed syllabus, duration, and competency mapping for an iGOT course."""
        pass

    @abstractmethod
    def recommend_courses(self, employee_id: str, skill_gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Query iGOT recommendation engine based on verified MoSPI/NSSTA skill gaps."""
        pass

    @abstractmethod
    def enroll_employee(self, employee_id: str, course_id: str) -> Dict[str, Any]:
        """Initiate single-sign-on course enrollment on iGOT Karmayogi for a verified official."""
        pass

    @abstractmethod
    def get_enrollment_status(self, employee_id: str, course_id: str) -> Dict[str, Any]:
        """Check employee completion and progress status on an enrolled iGOT course."""
        pass

    @abstractmethod
    def sync_competency_update(self, employee_id: str, competency_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync updated MoSPI competency score/certificate back into iGOT profile."""
        pass


class IGotAdapter(IGotAdapterInterface):
    """
    Staged implementation for Phase 1.
    All live methods raise NotImplementedError with descriptive diagnostic context.
    """

    def __init__(self, api_base_url: Optional[str] = None, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        self.api_base_url = api_base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.is_configured = bool(api_base_url and client_id and client_secret)

    def get_status(self) -> Dict[str, Any]:
        """Telemetry check for iGOT adapter state."""
        return {
            "adapter": "iGOT Karmayogi Adapter",
            "status": "pending_official_access",
            "is_configured": self.is_configured,
            "message": "iGOT Karmayogi API integration interface active. Pending official government credentials and endpoint specifications."
        }

    def get_course_catalogue(self, query: Optional[str] = None, page: int = 1, page_size: int = 20) -> List[Dict[str, Any]]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")

    def get_course_details(self, course_id: str) -> Dict[str, Any]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")

    def recommend_courses(self, employee_id: str, skill_gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")

    def enroll_employee(self, employee_id: str, course_id: str) -> Dict[str, Any]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")

    def get_enrollment_status(self, employee_id: str, course_id: str) -> Dict[str, Any]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")

    def sync_competency_update(self, employee_id: str, competency_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("iGOT integration pending official API access. Awaiting official Karmayogi endpoint specifications.")


igot_adapter = IGotAdapter()
