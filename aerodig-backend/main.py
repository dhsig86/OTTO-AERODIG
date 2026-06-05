"""
OTTO Aerodigestive Hub - Backend FastAPI

Hub clinico-editorial brasileiro de medicina aerodigestiva pediatrica.
Padrao arquitetural espelha o OTTO PROTTO: FastAPI + Render + Firebase.
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.conditions import router as conditions_router
from routers.pathways import router as pathways_router
from routers.instruments import router as instruments_router
from routers.procedures import router as procedures_router
from routers.frontier import router as frontier_router
from routers.network import router as network_router
from routers.news import router as news_router
from routers.events import router as events_router
from routers.search import router as search_router
from routers.jobs import router as jobs_router
from routers.calculators import router as calculators_router

load_dotenv()

app = FastAPI(
    title="OTTO Aerodigestive Hub API",
    version="0.1.0",
    description="Hub clinico-editorial de medicina aerodigestiva pediatrica - OTTO Ecosystem.",
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:5175",
    "https://otto-aerodig.vercel.app",
    "https://otto.drdariohart.com",
    "https://ottopwa.vercel.app",
    "https://ottos-plum.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_iframe_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "ALLOW-FROM https://otto.drdariohart.com"
    response.headers["Content-Security-Policy"] = (
        "frame-ancestors 'self' https://otto.drdariohart.com "
        "https://ottopwa.vercel.app https://ottos-plum.vercel.app https://otto-aerodig.vercel.app"
    )
    return response


app.include_router(conditions_router)
app.include_router(pathways_router)
app.include_router(instruments_router)
app.include_router(procedures_router)
app.include_router(frontier_router)
app.include_router(network_router)
app.include_router(news_router)
app.include_router(events_router)
app.include_router(search_router)
app.include_router(jobs_router)
app.include_router(calculators_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "otto-aerodig-api",
        "version": "0.1.0",
        "frontend_url": os.getenv("FRONTEND_URL", ""),
    }


@app.get("/")
def root():
    return {
        "service": "OTTO Aerodigestive Hub API",
        "docs": "/docs",
        "health": "/health",
    }
