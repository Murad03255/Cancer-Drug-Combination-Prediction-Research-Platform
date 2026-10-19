"""
Cancer Drug Combination Prediction & Research Platform — FastAPI Main Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import init_db
from app.ml.pipeline import get_predictor
from app.routers import auth, predict, recommend, evaluate, health, hybrid, synergy_finder

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and warm up predictor
    print("[*] Initializing Database...")
    init_db()
    print("[*] Warming up ML Engine...")
    get_predictor()
    yield
    print("[*] Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Cancer Drug Combination Prediction & Research Platform API",
    lifespan=lifespan
)

# CORS Configuration for local frontend and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development & preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(recommend.router)
app.include_router(evaluate.router)
app.include_router(hybrid.router)
app.include_router(synergy_finder.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Cancer Drug Combination Prediction & Research Platform API",
        "docs_url": "/docs",
        "health": "/health"
    }
