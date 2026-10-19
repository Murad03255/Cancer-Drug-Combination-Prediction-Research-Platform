"""
Cancer Drug Combination Prediction & Research Platform — Health & Status Router
"""
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.config import get_settings
from app.ml.pipeline import get_predictor
from app.database import engine

router = APIRouter(prefix="", tags=["Health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
def check_health():
    predictor = get_predictor()
    db_ok = False
    try:
        with engine.connect() as conn:
            db_ok = True
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if (predictor.loaded and db_ok) else "degraded",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        model_loaded=predictor.loaded,
        db_connected=db_ok
    )
