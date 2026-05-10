"""GET /api/calculators — calculadoras clínicas interativas."""
from fastapi import APIRouter, HTTPException

from models.schemas import Calculator
from services.content_loader import load_calculators

router = APIRouter(prefix="/api/calculators", tags=["calculators"])


@router.get("", response_model=list[Calculator])
def list_calculators(domain: str | None = None) -> list[Calculator]:
    items = load_calculators()
    if domain:
        items = [c for c in items if c.domain == domain]
    return items


@router.get("/{slug}", response_model=Calculator)
def get_calculator(slug: str) -> Calculator:
    for c in load_calculators():
        if c.slug == slug:
            return c
    raise HTTPException(status_code=404, detail=f"Calculator '{slug}' not found")
