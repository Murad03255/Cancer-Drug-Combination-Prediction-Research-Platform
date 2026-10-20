# 🧬 Project Proposal: SynergiOnco AI
## Cancer Drug Combination Prediction and Research Platform

**Course / Module:** Module 27 [Capstone Project]  
**Student Name:** [Your Name]  
**Submission Date:** October 2026  
**Project Repository:** https://github.com/[your-username]/SynergiOncoAI  
**Live Deployed Platform:** https://synergionco-ai.vercel.app  

---

### 1. Problem Statement
Cancer is one of the leading causes of human mortality worldwide. In clinical oncology, single-agent monotherapy is rarely sufficient to achieve long-term remission because malignant cells rapidly develop acquired resistance through alternative bypass signaling pathways. To prevent resistance and enhance therapeutic potency, oncologists administer combination therapies where two or more compounds act synchronously on cancer pathways.

However, combinatorial wet-lab screening faces an insurmountable bottleneck: testing pairwise combinations of just 100 candidate compounds yields nearly 5,000 distinct pairs. Testing these pairs across hundreds of cancer cell lines at varying concentration gradients requires years of laboratory labor and millions of dollars. Consequently, thousands of synergistic drug combinations remain undiscovered, and patients frequently receive empirically chosen rather than data-driven regimens. 

There is an urgent real-world need for an intelligent computational platform capable of learning from published high-throughput oncology assays to accurately predict which drug pairs will produce a synergistic antitumor response for a given cancer lineage before initiating costly wet-lab trials.

---

### 2. Proposed Solution
We propose **SynergiOnco AI**, an end-to-end full-stack web and machine learning research platform that empowers biomedical researchers to:
1. **Interactive Dual-Drug Synergy Prediction:** Select any two therapeutic agents and a cancer cell line to predict the Bliss Independence synergy score, accompanied by categorical response classification (*Synergistic*, *Additive*, or *Antagonistic*).
2. **Prioritized Combinatorial Discovery:** Explore ranked lists of synergistic drug combinations filtered by cancer lineages (Melanoma, Breast, Lung, Colorectal, Glioblastoma, Leukemia, etc.) with Plotly.js pairwise synergy interaction heatmaps.
3. **SynergyFinder 3D Topologies:** Visualize checkerboard concentration matrices, single-agent sigmoidal Hill curves, and rotatable 3D synergy surface plots across four reference mathematical models (ZIP, Bliss, Loewe, and HSA).
4. **Wet-Lab Experimental Verification:** Upload real in-vitro laboratory screening CSV files to compute statistical concordance metrics ($r$, RMSE, MAE, ROC-AUC) against model predictions.
5. **Explainability & Safety Profiling:** Inspect feature contribution signatures (SHAP-inspired weights) and toxicity/safety alerts.

*Research Disclaimer: SynergiOnco AI is explicitly designated as an in-silico prioritization research tool and not a clinical diagnosis or treatment prescription system.*

---

### 3. AI / ML Approach & Methodology
- **Supervised Machine Learning Task:** Formulation as both a continuous regression task (predicting Bliss synergy score $\delta$) and a binary classification task (synergistic when $\delta > 10$, non-synergistic otherwise).
- **Primary Model (XGBoost):** Histogram-based gradient boosted decision trees (`tree_method='hist'`) tuned for complex non-linear interaction terms and chemical-pathway cross-features.
- **Ensemble Benchmarking:** Comparative training against Random Forest Regressor (bagging ensemble) and Ridge Regression (L2-regularized linear baseline).
- **Data Leakage Prevention:** Rigorous **5-Fold GroupKFold cross-validation** grouped strictly by drug pair, guaranteeing that no compound pair present in the test fold appeared during training.
- **Datasets Utilized:**
  1. **DrugComb Consortium v1.4:** 391,178 real screened combination experiments across 4,150 drugs and 112 cancer cell lines.
  2. **GDSC (Genomics of Drug Sensitivity in Cancer):** 542 pharmacological compounds with target-encoded cell growth properties.
  3. **CCLE / COSMIC:** Genomic lineage mapping of cell lines to 13 human cancer types.
- **Evaluation Metrics:** Pearson correlation coefficient ($r$), Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), ROC-AUC, Precision, Recall, and F1-score.

---

### 4. Technical Architecture & Tech Stack

| Component | Technology | Rationale & Deployment |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite 8, Tailwind CSS v4, Plotly.js | Ultra-responsive SPA, glassmorphism dark biotech theme, 3D WebGL plots. Hosted on **Vercel**. |
| **Backend API** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 | High-throughput async REST endpoints, automatic OpenAPI/Swagger documentation. Hosted on **Render**. |
| **Database** | PostgreSQL (Supabase) / SQLite3 | Persistent storage of user authentication, drug catalogs, and prediction audit logs via SQLAlchemy ORM. |
| **ML Engine** | scikit-learn, XGBoost, NumPy, SciPy, Joblib | GroupKFold cross-validated model pipelines with sub-50ms serialized inference. |
| **Version Control** | Git & GitHub | Modular repo structure (`/frontend`, `/backend`, `/ml`, `/docs`), atomic commit history. |

---

### 5. Expected Outcomes & Impact
By computational pre-filtering of synergistic pairs, SynergiOnco AI reduces the wet-lab testing space by over 80%, allowing researchers to prioritize only high-probability leads. The platform delivers an accessible, public URL with empirical validation reports, bridging machine learning research and translational oncology.
