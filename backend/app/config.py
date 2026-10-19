"""
Cancer Drug Combination Prediction & Research Platform — Backend Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "Cancer Drug Combination Prediction & Research Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./cancer_prediction.db"  # fallback for local dev
    )

    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cancer-prediction-platform-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ML Models
    MODEL_DIR: str = os.getenv(
        "MODEL_DIR",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "saved_models")
    )

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
