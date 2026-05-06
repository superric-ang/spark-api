"""
FATE ENGINE: Returns 1 curated wild-card per day.
Algorithm:
1. Identify user's consistent patterns (age range, max distance, typical compatibility score)
2. Find a candidate who deviates on 1-2 surface dimensions but scores >80% on DEPTH
3. Surface with framing context for the rationale API call

Returns: single Profile with deviation_dimensions[] for rationale generation
"""

from typing import Dict, Any, Optional, List
import random

class FateEngine:
    def __init__(self):
        self.daily_fate_cards = {}  # user_id -> fate_card

    def get_fate_card(self, user_id: str, user_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get or generate today's fate card for user"""
        if user_id in self.daily_fate_cards:
            return self.daily_fate_cards[user_id]

        # Generate a fate card (mock for now)
        fate_card = self._generate_fate_card(user_profile)
        self.daily_fate_cards[user_id] = fate_card

        return fate_card

    def _generate_fate_card(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a fate card that deviates from user's patterns"""
        # Mock fate card
        deviation_dimensions = ["age", "location"]

        return {
            "profile": {
                "id": "fate_mock",
                "name": "Jordan",
                "birthdate": "1985-03-15",  # Different age
                "city": "Bangkok",  # Different location
                "intent": "serious",
                "photos": [{"url": "https://example.com/fate.jpg", "is_primary": True, "is_verified": False, "order": 0}]
            },
            "scores": {"overall": 0.85},
            "breakdown": {"values": 0.9, "lifestyle": 0.8, "goals": 0.9},
            "engine_source": "fate",
            "deviation_dimensions": deviation_dimensions
        }