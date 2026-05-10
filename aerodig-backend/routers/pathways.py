"""GET /api/pathways — fluxos de decisão aerodigestivos."""
from fastapi import APIRouter, HTTPException

from models.schemas import Pathway
from services.content_loader import load_pathways

router = APIRouter(prefix="/api/pathways", tags=["pathways"])


@router.get("", response_model=list[Pathway])
def list_pathways() -> list[Pathway]:
    return load_pathways()


@router.get("/{slug}", response_model=Pathway)
def get_pathway(slug: str) -> Pathway:
    for p in load_pathways():
        if p.slug == slug:
            return p
    raise HTTPException(status_code=404, detail=f"Pathway '{slug}' not found")
