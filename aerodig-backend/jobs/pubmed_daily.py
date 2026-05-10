"""
Job diário — PubMed E-utilities → relevance scoring → resumo PT-BR → Firestore (status='pending').

Chamado via cron Render (06:00 BRT) ou manualmente:
    python -m jobs.pubmed_daily
"""
import asyncio
import os
from datetime import date, datetime

from services import llm, pubmed, relevance_score
from services.content_loader import load_pubmed_queries

try:
    import firebase_db
except ImportError:  # pragma: no cover
    firebase_db = None  # type: ignore


async def run_once(dry_run: bool = False) -> tuple[int, int, list[str]]:
    """Roda o pipeline uma vez. Retorna (fetched, persisted, errors)."""
    queries = load_pubmed_queries()
    fetched = 0
    persisted = 0
    errors: list[str] = []

    seen_pmids: set[str] = set()

    for q in queries:
        term = q.get("term") or q.get("query")
        if not term:
            continue
        try:
            pmids = await pubmed.esearch(term, max_results=q.get("max_results", 30))
            new_pmids = [p for p in pmids if p not in seen_pmids]
            seen_pmids.update(new_pmids)
            articles = await pubmed.efetch(new_pmids)
            fetched += len(articles)
        except Exception as exc:
            errors.append(f"{term}: {exc}")
            continue

        for art in articles:
            score = relevance_score.score(art)
            if score < 0.4:
                continue
            summary = await llm.summarize_ptbr(
                art.get("title", ""),
                art.get("abstract", ""),
                art.get("journal", ""),
                art.get("year"),
            )

            if dry_run or firebase_db is None or firebase_db.get_db() is None:
                persisted += 1
                continue

            try:
                _persist(art, score, summary, q.get("domain_tags", []))
                persisted += 1
            except Exception as exc:
                errors.append(f"persist {art.get('pmid')}: {exc}")

    return fetched, persisted, errors


def _persist(article: dict, score: float, summary: str | None, domain_tags: list[str]) -> None:
    db = firebase_db.get_db()  # type: ignore[attr-defined]
    if db is None:
        return
    doc_id = article.get("pmid") or article.get("doi") or f"pubmed-{article.get('title','')[:40]}"
    pub_date = None
    if article.get("year"):
        try:
            pub_date = date(int(article["year"]), 1, 1).isoformat()
        except Exception:
            pub_date = None
    payload = {
        "pmid": article.get("pmid"),
        "doi": article.get("doi"),
        "title_pt": article.get("title", ""),
        "title_en": article.get("title", ""),
        "journal": article.get("journal", ""),
        "abstract_en": article.get("abstract", ""),
        "summary_ptbr": summary,
        "relevance_score": score,
        "domain_tags": domain_tags,
        "status": "pending",
        "pub_date": pub_date,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    db.collection("news_items").document(doc_id).set(payload, merge=True)


def main() -> None:
    dry = os.getenv("DRY_RUN", "false").lower() == "true"
    fetched, persisted, errors = asyncio.run(run_once(dry_run=dry))
    print(f"[pubmed_daily] fetched={fetched} persisted={persisted} errors={len(errors)}")
    for e in errors:
        print(f"  ! {e}")


if __name__ == "__main__":
    main()
