import pytest
from apps.search_rag.embeddings import generate_embedding, cosine_similarity

class TestRAGSearch:
    def test_embeddings_generation(self):
        text = "Amazon Web Services cloud hosting invoice monthly fee"
        vec = generate_embedding(text)
        assert isinstance(vec, list)
        assert len(vec) > 0

    def test_cosine_similarity(self):
        vec1 = generate_embedding("AWS cloud database billing")
        vec2 = generate_embedding("AWS cloud database billing")
        vec3 = generate_embedding("Completely unrelated fruit pineapple smoothie")

        sim_identical = cosine_similarity(vec1, vec2)
        sim_unrelated = cosine_similarity(vec1, vec3)

        assert sim_identical >= 0.99
        assert sim_identical > sim_unrelated
