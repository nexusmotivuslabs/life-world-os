"""
Reality Intelligence Engine — FastAPI entry point.
Runs on port 8100.
"""
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env from rie-backend directory so FRED_API_KEY and DATABASE_PATH are set
# even when running from monorepo root (e.g. uvicorn apps.rie-backend.main:app)
_load_env = Path(__file__).resolve().parent / ".env"
load_dotenv(_load_env)

from database.db import init_db
from api.routes.dashboard import router as dashboard_router
from api.routes.constraint import router as constraint_router
from api.routes.refresh import router as refresh_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Reality Intelligence Engine",
    description="UK macro constraint intelligence — deterministic signal detection and early warning scoring.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5002", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix="/api")
app.include_router(constraint_router, prefix="/api")
app.include_router(refresh_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "rie-backend"}
