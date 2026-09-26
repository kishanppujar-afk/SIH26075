"""Document Text Extraction Service

Extracts readable text from uploaded PDF, TXT, Markdown, and common document formats.
"""
import os
import io
import logging
from typing import Tuple
from pypdf import PdfReader

logger = logging.getLogger(__name__)


def extract_text_from_file(file_path: str, mime_type: str) -> Tuple[str, int]:
    """
    Extracts plain text from file on disk.

    Returns:
        (extracted_text, character_count)
    """
    if not os.path.exists(file_path):
        return "", 0

    text_parts = []

    try:
        if "pdf" in mime_type.lower() or file_path.lower().endswith(".pdf"):
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            full_text = "\n\n".join(text_parts).strip()
            return full_text, len(full_text)

        # Plain text, markdown, csv, or json
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read().strip()
            return full_text, len(full_text)

    except Exception as e:
        logger.error(f"Failed extracting text from {file_path}: {e}")
        return f"Extraction error: {str(e)}", 0
