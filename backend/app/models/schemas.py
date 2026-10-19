"""
Cancer Drug Combination Prediction & Research Platform — Pydantic Schemas for API Request/Response
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Auth ───
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Prediction ───
class PredictionRequest(BaseModel):
    drug_a: str
    drug_b: str
    cell_line: str


class ShapFeature(BaseModel):
    feature: str
    importance: float
    contribution: Optional[float] = 0.0
    effect: Optional[str] = "positive"
    description: Optional[str] = None


class PredictionResponse(BaseModel):
    drug_a: str
    drug_b: str
    cell_line: str
    cancer_type: str
    synergy_score: float
    synergy_class: str  # synergistic / additive / antagonistic
    confidence: float
    model_used: str
    base_value: Optional[float] = 4.25
    ci_lower: Optional[float] = None
    ci_upper: Optional[float] = None
    key_biomarker: Optional[str] = None
    all_predictions: Optional[Dict[str, float]] = None
    shap_features: List[ShapFeature] = []


# ─── Recommendation ───
class DrugPairRecommendation(BaseModel):
    rank: int
    drug_a: str
    drug_b: str
    synergy_score: float
    synergy_class: str


class RecommendationResponse(BaseModel):
    cancer_type: str
    cell_line: str
    total_pairs: int
    recommendations: List[DrugPairRecommendation]


# ─── Evaluation ───
class EvaluationMetrics(BaseModel):
    rmse: float
    mae: float
    pearson_r: float
    roc_auc: Optional[float] = None
    f1_score: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    n_samples: int
    predictions: List[dict] = []


# ─── Health ───
class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_loaded: bool
    db_connected: bool


# ─── Drug / CellLine Listing ───
class DrugInfo(BaseModel):
    name: str
    smiles: Optional[str] = None

    class Config:
        from_attributes = True


class CellLineInfo(BaseModel):
    name: str
    cancer_type: str
    tissue: Optional[str] = None

    class Config:
        from_attributes = True
