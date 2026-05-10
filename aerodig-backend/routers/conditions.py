"""GET /api/conditions — Atlas de condições aerodigestivas."""
from fastapi import APIRouter, HTTPException

from models.schemas import Condition
from services.content_loader import load_conditions

router = APIRouter(prefix="/api/conditions", tags=["conditions"])


@router.get("", response_model=list[Condition])
def list_conditions(domain: str | None = None) -> list[Condition]:
    items = load_conditions()
    if domain:
        items = [c for c in items if c.domain == domain]
    return items


@router.get("/{slug}", response_model=Condition)
def get_condition(slug: str) -> Condition:
    for c in load_conditions():
        if c.slug == slug:
            return c
    raise HTTPException(status_code=404, detail=f"Condition '{slug}' not found")
