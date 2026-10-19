"""
Cancer Drug Combination Prediction & Research Platform — SQLAlchemy Database Models
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = relationship("PredictionHistory", back_populates="user")


class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    smiles = Column(Text, nullable=True)
    pubchem_cid = Column(String(50), nullable=True)


class CellLine(Base):
    __tablename__ = "cell_lines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    cancer_type = Column(String(255), nullable=False)
    tissue = Column(String(255), nullable=True)


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    drug_a_name = Column(String(255), nullable=False)
    drug_b_name = Column(String(255), nullable=False)
    cell_line_name = Column(String(255), nullable=False)
    cancer_type = Column(String(255), nullable=False)
    synergy_score = Column(Float, nullable=False)
    synergy_class = Column(String(50), nullable=False)  # synergistic / additive / antagonistic
    model_used = Column(String(50), default="xgboost")
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="predictions")
