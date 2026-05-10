"""GET /api/procedures — procedimentos com outcome sets obrigatórios."""
from fastapi import APIRouter, HTTPException

from models.schemas import Procedure
from services.content_loader import load_procedures

router = APIRouter(prefix="/api/procedures", tags=["procedures"])


@router.get("", response_model=list[Procedure])
def list_procedures() -> list[Procedure]:
    return load_procedures()


@router.get("/{slug}", response_model=Procedure)
def get_procedure(slug: str) -> Procedure:
    for p in load_procedures():
        if p.slug == slug:
            return p
    raise HTTPException(status_code=404, detail=f"Procedure '{slug}' not found")
