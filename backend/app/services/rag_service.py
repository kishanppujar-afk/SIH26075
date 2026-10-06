"""RAG Pipeline Service for Training Materials

Provides:
1. Paragraph-sized document chunking (a few hundred words per chunk).
2. Dense 768-d vector embedding via local Ollama nomic-embed-text.
3. Spread chunk sampling across document sections (beginning, middle, end).
"""
import uuid
import re
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.material_quiz import UploadedMaterial, MaterialChunk
from app.ai.embeddings import OllamaSemanticMatcher

logger = logging.getLogger(__name__)
semantic_matcher = OllamaSemanticMatcher()


def split_into_chunks(
    text: str,
    target_words: int = 250,
    max_chunk_words: int = 350
) -> List[str]:
    """
    Splits document text into paragraph-sized chunks (a few hundred words each).
    Groups small consecutive paragraphs and splits overly large paragraphs by sentence boundaries.
    """
    if not text or not text.strip():
        return []

    # First split by double newlines or single newlines
    raw_paragraphs = [p.strip() for p in re.split(r'\n\s*\n|\r\n\s*\r\n', text) if p.strip()]
    if not raw_paragraphs:
        raw_paragraphs = [p.strip() for p in text.split('\n') if p.strip()]

    chunks = []
    current_words = []

    for para in raw_paragraphs:
        words = para.split()
        if not words:
            continue

        # If a single paragraph is larger than max_chunk_words, split it by sentence
        if len(words) > max_chunk_words:
            sentences = re.split(r'(?<=[.!?])\s+', para)
            for sentence in sentences:
                s_words = sentence.split()
                if not s_words:
                    continue
                if len(current_words) + len(s_words) > target_words and len(current_words) >= 60:
                    chunks.append(" ".join(current_words))
                    # Sliding window overlap: keep the last ~50 words for context
                    overlap_words = current_words[-50:] if len(current_words) > 50 else current_words[-20:]
                    current_words = overlap_words + s_words
                else:
                    current_words.extend(s_words)
        else:
            # Check if adding this paragraph exceeds target words
            if len(current_words) + len(words) > target_words and len(current_words) >= 60:
                chunks.append(" ".join(current_words))
                # Sliding window overlap: keep the last paragraph or last ~50 words
                overlap_words = current_words[-50:] if len(current_words) > 50 else []
                current_words = overlap_words + words
            else:
                current_words.extend(words)

    if current_words and len(current_words) > 30:
        chunks.append(" ".join(current_words))

    # Fallback if text was compact
    if not chunks and text.strip():
        chunks = [text.strip()[:2000]]

    return chunks


async def chunk_and_embed_material(db: Session, material_id: str) -> List[MaterialChunk]:
    """
    Extracts chunks from material text and computes dense embeddings via nomic-embed-text.
    Stores each chunk as a row in material_chunks table.
    """
    material = db.query(UploadedMaterial).filter(UploadedMaterial.id == material_id).first()
    if not material:
        logger.error(f"Material {material_id} not found for chunking")
        return []

    text = material.extracted_text or ""
    if not text.strip():
        material.status = "failed"
        db.commit()
        return []

    material.status = "processing"
    db.commit()

    # Clear any previous chunks
    db.query(MaterialChunk).filter(MaterialChunk.material_id == material_id).delete()

    raw_chunks = split_into_chunks(text)
    saved_chunks = []

    for idx, chunk_text in enumerate(raw_chunks):
        chunk_id = f"chk-{uuid.uuid4().hex[:12]}"
        # Generate embedding via Ollama nomic-embed-text
        embedding = None
        try:
            embedding = await semantic_matcher.get_embedding(chunk_text)
        except Exception as e:
            logger.warning(f"Embedding failed for chunk {idx}: {e}")

        chunk_row = MaterialChunk(
            id=chunk_id,
            material_id=material.id,
            chunk_index=idx,
            chunk_text=chunk_text,
            embedding=embedding
        )
        db.add(chunk_row)
        saved_chunks.append(chunk_row)

    material.status = "processed"
    db.commit()
    logger.info(f"Material {material.id} chunked into {len(saved_chunks)} paragraph blocks with embeddings.")
    return saved_chunks


def select_spread_chunks(chunks: List[MaterialChunk], num_questions: int) -> List[MaterialChunk]:
    """
    Selects chunks spread across different parts of the document (beginning, middle, end)
    so questions are not clustered solely in the intro.
    """
    if not chunks:
        return []

    total_chunks = len(chunks)
    if total_chunks <= num_questions:
        # Round-robin if more questions requested than available chunks
        return [chunks[i % total_chunks] for i in range(num_questions)]

    # Evenly space sampling indices across [0, total_chunks - 1]
    selected = []
    step = (total_chunks - 1) / max(1, num_questions - 1)
    for i in range(num_questions):
        idx = int(round(i * step))
        idx = max(0, min(total_chunks - 1, idx))
        selected.append(chunks[idx])

    return selected
