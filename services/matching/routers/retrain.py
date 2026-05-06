from fastapi import APIRouter
from engines.flow import FlowEngine

router = APIRouter()
flow_engine = FlowEngine()

@router.post("/retrain")
async def retrain_models():
    """Retrain behavioral models with latest data"""
    try:
        flow_engine.retrain()
        return {"status": "success", "message": "Models retrained successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}