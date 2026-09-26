"""NSSTA / MoSPI Official Training Catalogue Integration

Loads and serves the verified catalogue of 53 official training programmes,
syllabi, and publications strictly sourced from NSSTA (https://nssta.gov.in/)
and MoSPI (https://mospi.gov.in/).
"""
import json
import os
from typing import List, Dict, Any

CATALOG_PATH = os.path.join(os.path.dirname(__file__), "nssta_catalog.json")


def load_nssta_catalog() -> List[Dict[str, Any]]:
    """Loads the authentic NSSTA and MoSPI training resource catalogue."""
    if not os.path.exists(CATALOG_PATH):
        return []
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


OFFICIAL_CATALOG = load_nssta_catalog()
