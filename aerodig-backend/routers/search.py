"""GET /api/search — busca textual cross-camadas."""
from fastapi import APIRouter

from models.schemas import SearchHit, SearchResult
from services.content_loader import (
    load_conditions,
    load_events,
    load_frontier,
    load_instruments,
    load_network,
    load_news,
    load_pathways,
    load_procedures,
)

router = APIRouter(prefix="/api/search", tags=["search"])


def _matches(text: str, query: str) -> bool:
    return query.lower() in (text or "").lower()


@router.get("", response_model=SearchResult)
def search(q: str, limit: int = 30) -> SearchResult:
    q_clean = q.strip()
    hits: list[SearchHit] = []

    if not q_clean:
        return SearchResult(query=q, total=0, hits=[])

    for c in load_conditions():
        if _matches(c.title_pt, q_clean) or _matches(c.title_en, q_clean) or _matches(c.summary, q_clean):
            hits.append(
                SearchHit(
                    entity_type="condition",
                    slug=c.slug,
                    title_pt=c.title_pt,
                    title_en=c.title_en,
                    excerpt=c.summary[:240],
                    confidence=c.confidence,
                )
            )

    for p in load_pathways():
        if _matches(p.title_pt, q_clean) or _matches(p.entry_symptom, q_clean):
            hits.append(
                SearchHit(
                    entity_type="pathway",
                    slug=p.slug,
                    title_pt=p.title_pt,
                    title_en=p.title_en,
                    excerpt=p.entry_symptom,
                    confidence=p.confidence,
                )
            )

    for i in load_instruments():
        if _matches(i.title_pt, q_clean) or _matches(i.title_en, q_clean):
            hits.append(
                SearchHit(
                    entity_type="instrument",
                    slug=i.slug,
                    title_pt=i.title_pt,
                    title_en=i.title_en,
                    excerpt=i.interpretation[:240],
                    confidence=i.confidence,
                )
            )

    for pr in load_procedures():
        if _matches(pr.title_pt, q_clean) or _matches(pr.title_en, q_clean):
            hits.append(
                SearchHit(
                    entity_type="procedure",
                    slug=pr.slug,
                    title_pt=pr.title_pt,
                    title_en=pr.title_en,
                    excerpt=pr.technique_notes[:240],
                    confidence=pr.confidence,
                )
            )

    for f in load_frontier():
        if _matches(f.title_pt, q_clean) or _matches(f.summary, q_clean):
            hits.append(
                SearchHit(
                    entity_type="frontier",
                    slug=f.slug,
                    title_pt=f.title_pt,
                    title_en=f.title_en,
                    excerpt=f.summary[:240],
                    confidence=f.confidence,
                )
            )

    for n in load_network():
        if _matches(n.title_pt, q_clean) or _matches(n.institution, q_clean):
            hits.append(
                SearchHit(
                    entity_type="network",
                    slug=n.slug,
                    title_pt=n.title_pt,
                    title_en=n.title_en,
                    excerpt=f"{n.institution} — {n.city}, {n.country}",
                    confidence=n.confidence,
                )
            )

    for nw in load_news():
        if nw.status != "published":
            continue
        if _matches(nw.title_pt, q_clean) or _matches(nw.summary_ptbr or "", q_clean):
            hits.append(
                SearchHit(
                    entity_type="news",
                    slug=nw.slug,
                    title_pt=nw.title_pt,
                    title_en=nw.title_en,
                    excerpt=(nw.summary_ptbr or "")[:240],
                    confidence=nw.confidence,
                )
            )

    for ev in load_events():
        if _matches(ev.title_pt, q_clean) or _matches(ev.organizer, q_clean):
            hits.append(
                SearchHit(
                    entity_type="event",
                    slug=ev.slug,
                    title_pt=ev.title_pt,
                    title_en=ev.title_en,
                    excerpt=f"{ev.organizer} — {ev.location} — {ev.starts_on.isoformat()}",
                    confidence=ev.confidence,
                )
            )

    return SearchResult(query=q_clean, total=len(hits), hits=hits[:limit])
