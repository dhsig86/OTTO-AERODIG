"""GET /api/frontier — radar de fronteira (IA, 3D, genômica, biomarcadores)."""
from fastapi import APIRouter, HTTPException

from models.schemas import FrontierItem
from services.content_loader import load_frontier

router = APIRouter(prefix="/api/frontier", tags=["frontier"])


@router.get("", response_model=list[FrontierItem])
def list_frontier(technology: str | None = None) -> list[FrontierItem]:
    items = load_frontier()
    if technology:
        items = [i for i in items if i.technology == technology]
    return items


@router.get("/{slug}", response_model=FrontierItem)
def get_frontier(slug: str) -> FrontierItem:
    for i in load_frontier():
        if i.slug == slug:
            return i
    raise HTTPException(status_code=404, detail=f"Frontier item '{slug}' not found")
