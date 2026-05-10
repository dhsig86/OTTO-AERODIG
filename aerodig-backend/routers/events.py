"""GET /api/events — congressos, cursos e fellowships do campo aerodigestivo."""
from datetime import date

from fastapi import APIRouter, HTTPException

from models.schemas import Event
from services.content_loader import load_events

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[Event])
def list_events(upcoming: bool = True, event_type: str | None = None) -> list[Event]:
    items = load_events()
    today = date.today()
    if upcoming:
        items = [e for e in items if (e.ends_on or e.starts_on) >= today]
    if event_type:
        items = [e for e in items if e.event_type == event_type]
    items.sort(key=lambda e: e.starts_on)
    return items


@router.get("/{slug}", response_model=Event)
def get_event(slug: str) -> Event:
    for e in load_events():
        if e.slug == slug:
            return e
    raise HTTPException(status_code=404, detail=f"Event '{slug}' not found")
