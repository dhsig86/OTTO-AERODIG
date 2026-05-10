"""GET /api/instruments — escalas, scores e classificações validadas."""
from fastapi import APIRouter, HTTPException

from models.schemas import Instrument
from services.content_loader import load_instruments

router = APIRouter(prefix="/api/instruments", tags=["instruments"])


@router.get("", response_model=list[Instrument])
def list_instruments(domain: str | None = None) -> list[Instrument]:
    items = load_instruments()
    if domain:
        items = [i for i in items if i.domain == domain]
    return items


@router.get("/{slug}", response_model=Instrument)
def get_instrument(slug: str) -> Instrument:
    for i in load_instruments():
        if i.slug == slug:
            return i
    raise HTTPException(status_code=404, detail=f"Instrument '{slug}' not found")
