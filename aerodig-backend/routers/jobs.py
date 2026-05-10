"""POST /api/jobs/* — endpoints disparados por cron Render (autenticados por secret token)."""
import os
from datetime import datetime

from fastapi import APIRouter, Header, HTTPException

from models.schemas import JobReport

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _check_secret(x_cron_secret: str | None) -> None:
    expected = os.getenv("NEWS_CRON_SECRET", "")
    if not expected:
        # Em dev, sem secret configurado, permite execução
        return
    if x_cron_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid cron secret")


@router.post("/pubmed-daily", response_model=JobReport)
async def trigger_pubmed_daily(x_cron_secret: str | None = Header(None)) -> JobReport:
    _check_secret(x_cron_secret)
    # Lazy import: evita carregar httpx na inicialização do app
    from jobs.pubmed_daily import run_once

    started = datetime.utcnow()
    fetched, persisted, errors = await run_once(dry_run=False)
    return JobReport(
        job="pubmed-daily",
        started_at=started,
        finished_at=datetime.utcnow(),
        items_fetched=fetched,
        items_persisted=persisted,
        errors=errors,
    )
