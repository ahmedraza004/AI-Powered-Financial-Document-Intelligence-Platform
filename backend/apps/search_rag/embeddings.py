import math
import logging
import hashlib
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_embedding(text: str) -> list:
    """
    Generates an embedding vector for a given text snippet using OpenAI or fallback n-gram hash vector.
    """
    if not text.strip():
        return [0.0] * 64

    api_key = getattr(settings, 'OPENAI_API_KEY', None)
    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            response = client.embeddings.create(
                model=getattr(settings, 'OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
                input=text[:8000]
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning(f"OpenAI embedding generation failed ({str(e)}). Using fallback vectorizer.")

    # High-dimension fallback deterministic pseudo-semantic vectorizer (128 dimensions)
    dim = 128
    vector = [0.0] * dim
    words = text.lower().split()
    for i, word in enumerate(words):
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        idx = h % dim
        weight = 1.0 / (1.0 + math.log(1 + i))
        vector[idx] += weight

    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [round(x / norm, 6) for x in vector]


def cosine_similarity(vec1: list, vec2: list) -> float:
    """
    Calculates cosine similarity between two float vectors.
    """
    if not vec1 or not vec2:
        return 0.0
    
    # Handle dimension mismatch if any
    min_len = min(len(vec1), len(vec2))
    dot = sum(vec1[i] * vec2[i] for i in range(min_len))
    norm1 = math.sqrt(sum(vec1[i] * vec1[i] for i in range(min_len))) or 1.0
    norm2 = math.sqrt(sum(vec2[i] * vec2[i] for i in range(min_len))) or 1.0
    return dot / (norm1 * norm2)
