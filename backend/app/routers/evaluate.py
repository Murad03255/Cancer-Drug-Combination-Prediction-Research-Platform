"""
Cancer Drug Combination Prediction & Research Platform — Evaluation Router
Accepts lab experimental CSV files, calculates model predictions, and computes statistical metrics.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

from app.models.schemas import EvaluationMetrics
from app.ml.pipeline import get_predictor

router = APIRouter(prefix="", tags=["Evaluation"])


@router.post("/evaluate", response_model=EvaluationMetrics)
async def evaluate_experimental_file(file: UploadFile = File(...)):
    """
    Evaluates uploaded experimental lab assay CSV against model predictions.
    Computes RMSE, MAE, Pearson correlation (r), ROC-AUC, and F1-score.
    """
    predictor = get_predictor()
    if not predictor.loaded:
        raise HTTPException(status_code=503, detail="Prediction models are still loading or not available")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for evaluation")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty")

    results = predictor.evaluate_upload(df)

    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])

    return EvaluationMetrics(
        rmse=results["rmse"],
        mae=results["mae"],
        pearson_r=results["pearson_r"],
        roc_auc=results.get("roc_auc"),
        f1_score=results.get("f1_score"),
        precision=results.get("precision"),
        recall=results.get("recall"),
        n_samples=results["n_samples"],
        predictions=results["predictions"]
    )
