# ==============================================================================
# Cancer Drug Combination Prediction & Research Platform — Backend Dockerfile
# FastAPI + Machine Learning Inference Pipeline (XGBoost, Scikit-learn)
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    MODEL_DIR=/app/ml/saved_models \
    MODELS_OUT_DIR=/app/models_out

WORKDIR /app

# Install system dependencies (libgomp1 required for XGBoost OpenMP acceleration, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
# Using CPU wheels index for PyTorch to avoid downloading multi-gigabyte CUDA binaries
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r /app/requirements.txt

# Copy backend application code
COPY backend /app/backend

# Copy ML model artifacts
COPY ml/saved_models /app/ml/saved_models
COPY models_out /app/models_out

WORKDIR /app/backend

# Expose backend API port
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
