"""
Cancer Drug Combination Prediction & Research Platform — Recommendation Router
Provides ranked synergistic drug pairs for specified cancer types / cell lines.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.schemas import RecommendationResponse, DrugPairRecommendation
from app.ml.pipeline import get_predictor

router = APIRouter(prefix="", tags=["Recommendation"])


@router.get("/recommend", response_model=RecommendationResponse)
def get_recommendations(
    cancer_type: Optional[str] = Query(None, description="Cancer type to filter by"),
    cell_line: Optional[str] = Query(None, description="Specific cell line to query"),
    top_n: int = Query(15, ge=1, le=50, description="Number of top synergistic pairs to return")
):
    """
    Returns ranked high-confidence synergistic drug combinations for oncology research.
    """
    predictor = get_predictor()
    if not predictor.loaded:
        raise HTTPException(status_code=503, detail="Prediction models are still loading or not available")

    # Determine default cancer type or cell line if empty
    resolved_cancer = cancer_type or "Breast Cancer"
    resolved_cell_line = cell_line or ""

    ranked = predictor.recommend_pairs(
        cancer_type=cancer_type,
        cell_line=cell_line,
        top_n=top_n
    )

    recs = [
        DrugPairRecommendation(
            rank=item["rank"],
            drug_a=item["drug_a"],
            drug_b=item["drug_b"],
            synergy_score=item["synergy_score"],
            synergy_class=item["synergy_class"]
        )
        for item in ranked
    ]

    return RecommendationResponse(
        cancer_type=resolved_cancer,
        cell_line=resolved_cell_line or (ranked[0]["cell_line"] if ranked and "cell_line" in ranked[0] else "Default Model Line"),
        total_pairs=len(recs),
        recommendations=recs
    )
