"""
Cancer Drug Combination Prediction & Research Platform — Legacy Hybrid Single Drug Sensitivity & Alternative Medicine Recommender
Uses XGBoost, KNN, and Random Forest ensemble on GDSC CancerDataset.
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from typing import List, Dict, Any, Optional

MODELS_OUT_DIR = os.getenv(
    "MODELS_OUT_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models_out"))
)



class HybridSingleDrugPredictor:
    def __init__(self, model_dir: str = MODELS_OUT_DIR):
        self.model_dir = model_dir
        self.loaded = False
        self.xgb_model = None
        self.knn_model = None
        self.rf_model = None
        self.te_dict = None
        self.cat_cols = None
        self.num_cols = None
        self.global_mean = None
        self.unique_drugs: List[str] = []
        self.test_options: List[str] = []
        self.cancer_options: List[str] = []
        self.poly = None
        self.poly_cols = ['Z_SCORE_GDSC_poly_0', 'Z_SCORE_GDSC_poly_1']
        self._load()

    def _load(self):
        try:
            print("[*] Loading Legacy Hybrid Models (models_out)...")
            p = self.model_dir

            # XGBoost & KNN
            self.xgb_model = joblib.load(os.path.join(p, 'xgb_model.joblib'))
            self.knn_model = joblib.load(os.path.join(p, 'knn_model.joblib'))

            # RF is optional due to large size
            rf_path = os.path.join(p, 'rf_model.joblib')
            if os.path.exists(rf_path) and os.path.getsize(rf_path) < 500 * 1024 * 1024:
                try:
                    self.rf_model = joblib.load(rf_path)
                except Exception:
                    self.rf_model = None
            else:
                self.rf_model = None

            self.te_dict = joblib.load(os.path.join(p, 'target_encoders.joblib'))
            self.cat_cols = joblib.load(os.path.join(p, 'cat_cols.joblib'))
            self.num_cols = joblib.load(os.path.join(p, 'num_cols.joblib'))
            self.global_mean = joblib.load(os.path.join(p, 'global_mean.joblib'))

            # Load dataset to extract options
            data_path = os.path.join(p, 'CancerDataset.csv')
            if os.path.exists(data_path):
                df = pd.read_csv(data_path, low_memory=False)
                self.unique_drugs = sorted(df['DRUG_NAME'].dropna().unique().tolist())
                self.test_options = sorted(df['Growth Properties'].dropna().unique().tolist())
                self.cancer_options = sorted(df['Cancer Type (matching TCGA label)'].dropna().unique().tolist())

            # Initialize polynomial transformer
            self.poly = PolynomialFeatures(degree=2, include_bias=False)
            self.poly.fit(np.array([[0.0]]))

            self.loaded = True
            print(f"[OK] Hybrid Predictor Ready: {len(self.unique_drugs)} drugs, {len(self.cancer_options)} cancer types")
        except Exception as e:
            print(f"[WARN] Failed to load hybrid models: {e}")
            self.loaded = False

    def _build_feature_matrix(self, drug_list: List[str], test: str, cancer_type: str) -> pd.DataFrame:
        """Vectorized construction of feature matrix for multiple drugs."""
        rows = []
        for drug in drug_list:
            row = {}
            for c in self.cat_cols:
                if c == 'Growth Properties':
                    row[c] = test
                elif c == 'Cancer Type (matching TCGA label)':
                    row[c] = cancer_type
                elif c == 'DRUG_NAME':
                    row[c] = drug
                else:
                    row[c] = '__NA__'
            for n in self.num_cols:
                row[n] = 0.0
            for c in self.cat_cols:
                row[c + "_count"] = 1.0
            rows.append(row)

        X = pd.DataFrame(rows)
        for c in self.cat_cols:
            X[c + "_te"] = X[c].map(self.te_dict.get(c, {})).fillna(self.global_mean).astype(np.float32)
        X = X.drop(self.cat_cols, axis=1)

        # Polynomial features on Z_Score_GDSC
        z_poly = self.poly.transform(X[['Z_Score_GDSC']])
        X[self.poly_cols] = z_poly
        return X

    def predict_and_suggest(self, test: str, cancer_type: str, drugs_input: List[str]) -> Dict[str, Any]:
        if not self.loaded:
            return {"error": "Hybrid models not loaded"}

        clean_input = [d.strip() for d in drugs_input if d.strip()]
        if not clean_input:
            return {"error": "Please provide at least one drug name"}

        # 1. Evaluate User's Input Drugs
        X_input = self._build_feature_matrix(clean_input, test, cancer_type)
        xgb_preds = self.xgb_model.predict(X_input)
        knn_preds = self.knn_model.predict(X_input)
        rf_preds = self.rf_model.predict(X_input) if self.rf_model else None

        input_results = []
        combined_scores = []
        for i, drug in enumerate(clean_input):
            vals = [float(xgb_preds[i]), float(knn_preds[i])]
            if rf_preds is not None:
                vals.append(float(rf_preds[i]))
            comb = float(sum(vals) / len(vals))
            combined_scores.append(comb)
            input_results.append({
                "drug": drug,
                "combined_score": round(comb, 4),
                "xgb_score": round(float(xgb_preds[i]), 4),
                "knn_score": round(float(knn_preds[i]), 4),
                "rf_score": round(float(rf_preds[i]), 4) if rf_preds is not None else None,
            })

        min_combined_input = min(combined_scores) if combined_scores else 0.0

        # 2. Vectorized evaluation of candidate drugs for suggestion
        candidate_drugs = [d for d in self.unique_drugs if d not in clean_input]
        # Evaluate top 80 diverse candidates in batch for speed
        batch_drugs = candidate_drugs[:80]
        X_cand = self._build_feature_matrix(batch_drugs, test, cancer_type)
        c_xgb = self.xgb_model.predict(X_cand)
        c_knn = self.knn_model.predict(X_cand)
        c_rf = self.rf_model.predict(X_cand) if self.rf_model else None

        cand_results = []
        for i, drug in enumerate(batch_drugs):
            vals = [float(c_xgb[i]), float(c_knn[i])]
            if c_rf is not None:
                vals.append(float(c_rf[i]))
            comb = float(sum(vals) / len(vals))
            cand_results.append({
                "drug": drug,
                "score": round(comb, 5),
                "higher_than_input": comb > min_combined_input
            })

        # Sort descending by predicted sensitivity
        cand_results.sort(key=lambda x: x["score"], reverse=True)
        # Take top 8
        suggestions = [c for c in cand_results if c["higher_than_input"]][:8]
        if len(suggestions) < 8:
            suggestions = cand_results[:8]

        return {
            "test": test,
            "cancer_type": cancer_type,
            "input_results": input_results,
            "suggestions": suggestions,
            "min_input_score": round(min_combined_input, 4)
        }


# Singleton instance
_hybrid_predictor: Optional[HybridSingleDrugPredictor] = None

def get_hybrid_predictor() -> HybridSingleDrugPredictor:
    global _hybrid_predictor
    if _hybrid_predictor is None:
        _hybrid_predictor = HybridSingleDrugPredictor()
    return _hybrid_predictor
