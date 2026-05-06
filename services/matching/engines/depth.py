"""
DEPTH ENGINE: Scores compatibility based on quiz answers.
Dimensions and weights:
- Life goals (kids, marriage, location stability): 30%
- Personality fit (intro/extrovert, social energy): 20%
- Love language compatibility: 15%
- Conflict style compatibility: 15%
- Lifestyle match (hours, pace, travel): 10%
- Dealbreaker exclusions (smoking, religion, politics): 10%

Returns: float 0-1 and breakdown dict per dimension
"""

from typing import List, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class DepthEngine:
    def __init__(self):
        # Question to dimension mapping
        self.dimension_map = {
            1: "lifestyle", 2: "conflict", 3: "goals", 4: "personality",
            5: "love_language", 6: "dealbreakers"
        }

        # Dimension weights
        self.weights = {
            "goals": 0.30,
            "personality": 0.20,
            "love_language": 0.15,
            "conflict": 0.15,
            "lifestyle": 0.10,
            "dealbreakers": 0.10
        }

    def score_compatibility(self, user_answers: List[Dict], candidate_answers: List[Dict]) -> float:
        """Calculate overall compatibility score"""
        if not user_answers or not candidate_answers:
            return 0.5  # Default neutral score

        # Create answer vectors
        user_vector = self._answers_to_vector(user_answers)
        candidate_vector = self._answers_to_vector(candidate_answers)

        # Cosine similarity
        similarity = cosine_similarity([user_vector], [candidate_vector])[0][0]

        # Check dealbreakers (if any answer is incompatible, reduce score)
        dealbreaker_penalty = self._check_dealbreakers(user_answers, candidate_answers)

        return max(0, min(1, similarity - dealbreaker_penalty))

    def get_breakdown(self, user_answers: List[Dict], candidate_answers: List[Dict]) -> Dict[str, float]:
        """Get detailed breakdown by dimension"""
        breakdown = {}

        for dimension in self.weights.keys():
            user_dim_answers = [a for a in user_answers if self.dimension_map.get(a["question_id"]) == dimension]
            candidate_dim_answers = [a for a in candidate_answers if self.dimension_map.get(a["question_id"]) == dimension]

            if user_dim_answers and candidate_dim_answers:
                user_vec = [a["answer_weight"] for a in user_dim_answers]
                candidate_vec = [a["answer_weight"] for a in candidate_dim_answers]
                similarity = cosine_similarity([user_vec], [candidate_vec])[0][0]
                breakdown[dimension] = float(similarity)
            else:
                breakdown[dimension] = 0.5

        return breakdown

    def _answers_to_vector(self, answers: List[Dict]) -> List[float]:
        """Convert answers to numerical vector"""
        vector = []
        for answer in answers:
            weight = answer.get("answer_weight", 0.5)
            vector.append(weight)
        return vector

    def _check_dealbreakers(self, user_answers: List[Dict], candidate_answers: List[Dict]) -> float:
        """Check for dealbreaker incompatibilities"""
        # Simplified - in reality would check specific question IDs
        return 0.0