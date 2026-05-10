"""GET /api/network — mapa de centros, especialistas e fellowships."""
from fastapi import APIRouter, HTTPException

from models.schemas import NetworkNode
from services.content_loader import load_network

router = APIRouter(prefix="/api/network", tags=["network"])


@router.get("", response_model=list[NetworkNode])
def list_network(country: str | None = None, node_type: str | None = None) -> list[NetworkNode]:
    items = load_network()
    if country:
        items = [n for n in items if n.country.lower() == country.lower()]
    if node_type:
        items = [n for n in items if n.node_type == node_type]
    return items


@router.get("/{slug}", response_model=NetworkNode)
def get_node(slug: str) -> NetworkNode:
    for n in load_network():
        if n.slug == slug:
            return n
    raise HTTPException(status_code=404, detail=f"Network node '{slug}' not found")
