"""GET /api/news — feed de novidades curadas e fila de curadoria."""
from fastapi import APIRouter, HTTPException

from models.schemas import NewsItem
from services.content_loader import load_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=list[NewsItem])
def list_news(status: str = "published", limit: int = 50) -> list[NewsItem]:
    items = [n for n in load_news() if n.status == status]
    # Ordena por relevância desc, depois por data desc
    items.sort(
        key=lambda n: (-(n.relevance_score or 0.0), -(n.pub_date.toordinal() if n.pub_date else 0))
    )
    return items[:limit]


@router.get("/{slug}", response_model=NewsItem)
def get_news_item(slug: str) -> NewsItem:
    for n in load_news():
        if n.slug == slug:
            return n
    raise HTTPException(status_code=404, detail=f"News item '{slug}' not found")
