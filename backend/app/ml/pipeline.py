"""
Cancer Drug Combination Prediction & Research Platform — ML Prediction Pipeline

Loads trained models and provides prediction functions
for the FastAPI backend.
"""
import numpy as np
import pandas as pd
import joblib
import json
import os
from typing import Dict, List, Tuple, Optional


class SynergyPredictor:
    """Main prediction engine for drug combination synergy."""
    def __init__(self, model_dir: str = None):
        if model_dir is None:
            env_dir = os.getenv("MODEL_DIR")
            if env_dir and os.path.exists(env_dir):
                model_dir = env_dir
            else:
                # Check project root ml/saved_models
                candidate1 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "saved_models"))
                candidate2 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "saved_models"))
                candidate3 = os.path.abspath("/app/ml/saved_models")
                if os.path.exists(candidate1):
                    model_dir = candidate1
                elif os.path.exists(candidate2):
                    model_dir = candidate2
                elif os.path.exists(candidate3):
                    model_dir = candidate3
                else:
                    model_dir = candidate1
        self.model_dir = model_dir
        self.loaded = False
        self.xgb_model = None
        self.rf_model = None
        self.ridge_model = None
        self.encoders = None
        self.metadata = None
        self._load_models()

    def _load_models(self):
        """Load all trained models and encoders."""
        try:
            self.xgb_model = joblib.load(os.path.join(self.model_dir, "xgb_model.joblib"))
            self.rf_model = joblib.load(os.path.join(self.model_dir, "rf_model.joblib"))
            self.ridge_model = joblib.load(os.path.join(self.model_dir, "ridge_model.joblib"))
            self.encoders = joblib.load(os.path.join(self.model_dir, "encoders.joblib"))

            with open(os.path.join(self.model_dir, "metadata.json"), 'r') as f:
                self.metadata = json.load(f)

            self.loaded = True
            print(f"[OK] Models loaded from {self.model_dir}")
            print(f"   Drugs: {self.metadata['n_drugs']}, Cell lines: {self.metadata['n_cell_lines']}")
        except Exception as e:
            print(f"[WARN] Could not load models: {e}")
            self.loaded = False

    def get_drug_list(self) -> List[str]:
        if self.metadata:
            return self.metadata.get('drug_list', [])
        return []

    def get_cell_line_list(self) -> List[str]:
        if self.metadata:
            return self.metadata.get('cell_line_list', [])
        return []

    def get_cancer_type_list(self) -> List[str]:
        if self.metadata:
            return self.metadata.get('cancer_type_list', [])
        return []

    def get_model_metrics(self) -> List[Dict]:
        if self.metadata:
            return self.metadata.get('metrics', [])
        return []

    def _encode_input(self, drug_a: str, drug_b: str, cell_line: str) -> Optional[np.ndarray]:
        """Encode input features for prediction."""
        enc = self.encoders
        drug_enc = enc['drug_encoder']
        cell_enc = enc['cell_encoder']
        cancer_enc = enc['cancer_encoder']
        tissue_enc = enc['tissue_encoder']

        # Handle unknown drugs/cell lines gracefully
        try:
            drug_a_val = drug_enc.transform([drug_a])[0]
        except ValueError:
            drug_a_val = len(drug_enc.classes_)  # Unknown

        try:
            drug_b_val = drug_enc.transform([drug_b])[0]
        except ValueError:
            drug_b_val = len(drug_enc.classes_)

        try:
            cell_val = cell_enc.transform([cell_line])[0]
        except ValueError:
            cell_val = len(cell_enc.classes_)

        # Get cancer type from cell line data
        data_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "ml", "data", "processed"
        )
        cancer_type = "Unknown"
        tissue = "Unknown"
        try:
            cl_df = pd.read_csv(os.path.join(data_dir, "cell_lines.csv"))
            match = cl_df[cl_df['cell_line'] == cell_line]
            if not match.empty:
                cancer_type = match.iloc[0]['cancer_type']
                tissue = match.iloc[0].get('tissue', 'Unknown')
        except:
            pass

        try:
            cancer_val = cancer_enc.transform([cancer_type])[0]
        except ValueError:
            cancer_val = 0

        try:
            tissue_val = tissue_enc.transform([str(tissue)])[0]
        except ValueError:
            tissue_val = 0

        # Build feature vector
        features = [
            drug_a_val, drug_b_val, cell_val,
            cancer_val, tissue_val,
            drug_a_val * 1000 + drug_b_val,  # pair hash
            drug_a_val + drug_b_val,           # pair sum
            abs(drug_a_val - drug_b_val),      # pair diff
        ]

        # Pad with zeros for any additional features used in training
        n_expected = len(self.encoders['feature_cols'])
        while len(features) < n_expected:
            features.append(0.0)

        return np.array([features], dtype=np.float32), cancer_type

    def predict(self, drug_a: str, drug_b: str, cell_line: str,
                model_name: str = "xgboost") -> Dict:
        """
        Predict synergy score for a drug pair on a cell line.

        Returns dict with synergy_score, synergy_class, confidence, etc.
        """
        if not self.loaded:
            return {
                "error": "Models not loaded",
                "synergy_score": 0.0,
                "synergy_class": "unknown",
                "confidence": 0.0,
            }

        X, cancer_type = self._encode_input(drug_a, drug_b, cell_line)
        if X is None:
            return {
                "error": "Could not encode input",
                "synergy_score": 0.0,
                "synergy_class": "unknown",
                "confidence": 0.0,
            }

        # Predict with all models
        xgb_pred = float(self.xgb_model.predict(X)[0])
        rf_pred = float(self.rf_model.predict(X)[0])
        ridge_pred = float(self.ridge_model.predict(X)[0])

        # Select primary prediction
        model_preds = {
            "xgboost": xgb_pred,
            "random_forest": rf_pred,
            "ridge": ridge_pred,
        }

        primary_score = model_preds.get(model_name, xgb_pred)

        # Ensemble average for confidence estimation
        ensemble_avg = np.mean([xgb_pred, rf_pred, ridge_pred])
        ensemble_std = np.std([xgb_pred, rf_pred, ridge_pred])

        # Confidence: higher when models agree
        max_std = 30.0  # normalize
        confidence = max(0.0, min(1.0, 1.0 - (ensemble_std / max_std)))

        # Classify
        if primary_score > 10:
            synergy_class = "synergistic"
        elif primary_score < -10:
            synergy_class = "antagonistic"
        else:
            synergy_class = "additive"

        return {
            "drug_a": drug_a,
            "drug_b": drug_b,
            "cell_line": cell_line,
            "cancer_type": cancer_type,
            "synergy_score": round(float(primary_score), 4),
            "synergy_class": synergy_class,
            "confidence": round(float(confidence), 4),
            "model_used": model_name,
            "all_predictions": {
                "xgboost": round(float(xgb_pred), 4),
                "random_forest": round(float(rf_pred), 4),
                "ridge": round(float(ridge_pred), 4),
                "ensemble": round(float(ensemble_avg), 4),
            }
        }

    def recommend_pairs(self, cancer_type: str = None, cell_line: str = None,
                        top_n: int = 20) -> List[Dict]:
        """
        Recommend best drug pairs for a cancer type or cell line.
        """
        if not self.loaded:
            return []

        drugs = self.get_drug_list()
        if not drugs:
            return []

        # Use cell line if provided, otherwise pick first for cancer type
        target_cell_line = cell_line
        if not target_cell_line and cancer_type:
            data_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "ml", "data", "processed"
            )
            try:
                cl_df = pd.read_csv(os.path.join(data_dir, "cell_lines.csv"))
                match = cl_df[cl_df['cancer_type'] == cancer_type]
                if not match.empty:
                    target_cell_line = match.iloc[0]['cell_line']
            except:
                pass

        if not target_cell_line:
            target_cell_line = self.get_cell_line_list()[0] if self.get_cell_line_list() else "MCF7"

        # Predict for all pairs (limited to manageable size)
        predictions = []
        max_drugs = min(len(drugs), 50)  # Limit for speed
        selected_drugs = drugs[:max_drugs]

        for i in range(len(selected_drugs)):
            for j in range(i + 1, len(selected_drugs)):
                result = self.predict(selected_drugs[i], selected_drugs[j], target_cell_line)
                predictions.append(result)

        # Sort by synergy score (descending)
        predictions.sort(key=lambda x: x['synergy_score'], reverse=True)

        # Add rank
        ranked = []
        for idx, pred in enumerate(predictions[:top_n]):
            ranked.append({
                "rank": idx + 1,
                "drug_a": pred['drug_a'],
                "drug_b": pred['drug_b'],
                "synergy_score": pred['synergy_score'],
                "synergy_class": pred['synergy_class'],
                "confidence": pred['confidence'],
            })

        return ranked

    def evaluate_upload(self, df: pd.DataFrame) -> Dict:
        """
        Evaluate model predictions against uploaded experimental data.

        Expected columns: drug_a, drug_b, cell_line, actual_synergy
        """
        if not self.loaded:
            return {"error": "Models not loaded"}

        required_cols = ['drug_a', 'drug_b', 'cell_line']
        # Try to find actual synergy column
        actual_col = None
        for candidate in ['actual_synergy', 'bliss_synergy', 'synergy_score',
                          'synergy', 'bliss', 'score']:
            if candidate in df.columns:
                actual_col = candidate
                break

        if actual_col is None:
            return {"error": "No synergy score column found. Expected: actual_synergy, bliss_synergy, or synergy_score"}

        for col in required_cols:
            if col not in df.columns:
                return {"error": f"Missing required column: {col}"}

        predictions = []
        actuals = []
        details = []

        for _, row in df.iterrows():
            result = self.predict(
                str(row['drug_a']),
                str(row['drug_b']),
                str(row['cell_line'])
            )
            pred_score = result['synergy_score']
            actual_score = float(row[actual_col])

            predictions.append(pred_score)
            actuals.append(actual_score)

            details.append({
                "drug_a": str(row['drug_a']),
                "drug_b": str(row['drug_b']),
                "cell_line": str(row['cell_line']),
                "actual": round(actual_score, 4),
                "predicted": round(pred_score, 4),
                "error": round(abs(actual_score - pred_score), 4),
            })

        predictions = np.array(predictions)
        actuals = np.array(actuals)

        # Metrics
        rmse = float(np.sqrt(mean_squared_error(actuals, predictions)))
        mae = float(mean_absolute_error(actuals, predictions))
        try:
            pearson, _ = pearsonr(actuals, predictions)
            pearson = float(pearson)
        except:
            pearson = 0.0

        # Classification metrics
        actual_cls = (actuals > 10).astype(int)
        pred_cls = (predictions > 10).astype(int)
        try:
            auc = float(roc_auc_score(actual_cls, predictions))
        except:
            auc = None
        try:
            f1 = float(f1_score(actual_cls, pred_cls, zero_division=0))
            prec = float(precision_score(actual_cls, pred_cls, zero_division=0))
            rec = float(recall_score(actual_cls, pred_cls, zero_division=0))
        except:
            f1, prec, rec = 0.0, 0.0, 0.0

        return {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "pearson_r": round(pearson, 4),
            "roc_auc": round(auc, 4) if auc is not None else None,
            "f1_score": round(f1, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "n_samples": len(details),
            "predictions": details[:100],  # limit response size
        }


# Singleton instance — will be used by all routers
_predictor: Optional[SynergyPredictor] = None


def get_predictor() -> SynergyPredictor:
    global _predictor
    if _predictor is None:
        _predictor = SynergyPredictor()
    return _predictor


# Needed for evaluate_upload
from sklearn.metrics import mean_squared_error, mean_absolute_error
from scipy.stats import pearsonr
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score
