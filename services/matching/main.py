from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from engines.depth import DepthEngine
from engines.flow import FlowEngine
from engines.fate import FateEngine
import httpx

app = FastAPI(title="SPARK Matching Service")

# Models
class CandidateRequest(BaseModel):
    user_id: str
    weights: Dict[str, float]
    limit: int = 10
    exclude_ids: List[str] = []

class CandidateResponse(BaseModel):
    candidates: List[Dict[str, Any]]
    fate_card: Optional[Dict[str, Any]] = None

# Initialize engines
depth_engine = DepthEngine()
flow_engine = FlowEngine()
fate_engine = FateEngine()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

@app.post("/candidates", response_model=CandidateResponse)
async def get_candidates(request: CandidateRequest):
    try:
        # Fetch user profile and quiz answers from Supabase
        async with httpx.AsyncClient() as client:
            # Get user profile
            profile_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles",
                params={"id": f"eq.{request.user_id}", "select": "*"},
                headers={"Authorization": f"Bearer {SUPABASE_KEY}", "apikey": SUPABASE_KEY}
            )
            profile = profile_resp.json()[0] if profile_resp.json() else None

            # Get quiz answers
            quiz_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/quiz_answers",
                params={"user_id": f"eq.{request.user_id}", "select": "*"},
                headers={"Authorization": f"Bearer {SUPABASE_KEY}", "apikey": SUPABASE_KEY}
            )
            quiz_answers = quiz_resp.json()

            # Get potential candidates (simplified - would filter by location, preferences, etc.)
            candidates_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles",
                params={"id": f"neq.{request.user_id}", "select": "id,name,birthdate,quiz_answers(*)", "limit": "100"},
                headers={"Authorization": f"Bearer {SUPABASE_KEY}", "apikey": SUPABASE_KEY}
            )
            candidates = candidates_resp.json()

        # Score candidates
        scored_candidates = []
        for candidate in candidates:
            if candidate["id"] in request.exclude_ids:
                continue

            depth_score = depth_engine.score_compatibility(quiz_answers, candidate.get("quiz_answers", []))
            flow_score = flow_engine.score_candidate(request.user_id, candidate["id"])

            overall_score = (
                depth_score * request.weights.get("depth", 0.5) +
                flow_score * request.weights.get("flow", 0.5)
            )

            scored_candidates.append({
                "profile": candidate,
                "scores": {"overall": overall_score, "depth_score": depth_score, "flow_score": flow_score},
                "breakdown": depth_engine.get_breakdown(quiz_answers, candidate.get("quiz_answers", [])),
                "engine_source": "blend"
            })

        # Sort and limit
        scored_candidates.sort(key=lambda x: x["scores"]["overall"], reverse=True)
        final_candidates = scored_candidates[:request.limit-1]  # Save spot for fate card

        # Add fate card at position 3
        fate_card = fate_engine.get_fate_card(request.user_id, profile)
        if fate_card:
            final_candidates.insert(2, fate_card)

        return CandidateResponse(
            candidates=final_candidates,
            fate_card=fate_card
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain_models():
    # Retrain collaborative filtering matrices
    flow_engine.retrain()
    return {"status": "retrained"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)