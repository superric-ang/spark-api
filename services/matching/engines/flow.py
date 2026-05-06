"""
FLOW ENGINE: Scores candidates based on behavioral signals.
Uses collaborative filtering: find users with similar swipe patterns.
Signals weighted:
- Scroll depth on profile > 0.8 = strong interest signal
- Time spent on card > 10s = genuine interest
- Message response rate = quality match indicator
- Conversation length = compatibility signal

Returns: float 0-1 relevance score
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.decomposition import TruncatedSVD
import pickle
import os

class FlowEngine:
    def __init__(self):
        self.model_path = "flow_model.pkl"
        self.user_factors = {}
        self.item_factors = {}
        self._load_model()

    def score_candidate(self, user_id: str, candidate_id: str) -> float:
        """Score a candidate for a user based on behavioral patterns"""
        # For MVP, use simple heuristics
        # In production, use matrix factorization predictions

        # Mock scoring based on user ID hash for demo
        user_hash = hash(user_id) % 100
        candidate_hash = hash(candidate_id) % 100

        # Simulate collaborative filtering
        base_score = abs(np.sin(user_hash + candidate_hash)) * 0.5 + 0.25

        return min(1.0, base_score)

    def retrain(self):
        """Retrain the collaborative filtering model"""
        # In production, fetch actions data and rebuild matrices
        # For now, just save empty model
        self._save_model()

    def _load_model(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.user_factors = data.get('user_factors', {})
                self.item_factors = data.get('item_factors', {})

    def _save_model(self):
        """Save trained model to disk"""
        data = {
            'user_factors': self.user_factors,
            'item_factors': self.item_factors
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(data, f)