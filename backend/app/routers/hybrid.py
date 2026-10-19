"""
Cancer Drug Combination Prediction & Research Platform — Hybrid Single Drug Prediction & Suggestion Router
Legacy Feature: Growth Properties + Cancer Type + Input Drugs -> Hybrid Accuracy & Suggestions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.ml.hybrid_single_drug import get_hybrid_predictor

router = APIRouter(prefix="/hybrid", tags=["Hybrid Single Drug Suggestion"])


class HybridPredictRequest(BaseModel):
    test: str
    cancer_type: str
    drugs: List[str]


@router.get("/options")
def get_hybrid_options():
    """Return dropdown options for Growth Properties, Cancer Type, and available drugs."""
    predictor = get_hybrid_predictor()
    if not predictor.loaded:
        raise HTTPException(status_code=503, detail="Hybrid model assets not loaded")
    return {
        "test_options": predictor.test_options,
        "cancer_options": predictor.cancer_options,
        "available_drugs": predictor.unique_drugs[:100],  # top 100 for fast autocomplete
        "total_drugs": len(predictor.unique_drugs)
    }


@router.post("/predict")
def predict_hybrid(req: HybridPredictRequest):
    """
    Evaluates input drugs using the Hybrid Ensemble model (RF + XGB + KNN)
    and returns top 8 recommended alternative medicines with higher predicted sensitivity.
    """
    predictor = get_hybrid_predictor()
    if not predictor.loaded:
        raise HTTPException(status_code=503, detail="Hybrid model assets not loaded")

    if not req.test or not req.cancer_type:
        raise HTTPException(status_code=400, detail="Both 'test' (growth properties) and 'cancer_type' are required")

    if not req.drugs:
        raise HTTPException(status_code=400, detail="Please provide at least one drug name")

    res = predictor.predict_and_suggest(
        test=req.test.strip(),
        cancer_type=req.cancer_type.strip(),
        drugs_input=req.drugs
    )

    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])

    return res
