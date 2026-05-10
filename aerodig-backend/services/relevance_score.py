"""
Relevance scoring para news do PubMed.

Score em [0, 1] combinando: tier de revista, recência, densidade de keywords,
e match de termos MeSH-aerodigestivos.
"""
from datetime import date, timedelta
from typing import Iterable

# Tier de revistas (1.0 = top do campo, 0.5 = relevante mas geral)
JOURNAL_TIER: dict[str, float] = {
    "international journal of pediatric otorhinolaryngology": 1.00,
    "laryngoscope": 0.95,
    "laryngoscope investigative otolaryngology": 0.95,
    "jama otolaryngology--head & neck surgery": 1.00,
    "jama otolaryngology-head & neck surgery": 1.00,
    "annals of otology, rhinology, and laryngology": 0.85,
    "otolaryngology--head and neck surgery": 0.90,
    "journal of pediatric surgery": 0.90,
    "pediatrics": 0.85,
    "the journal of pediatrics": 0.85,
    "european archives of oto-rhino-laryngology": 0.80,
    "pediatric pulmonology": 0.80,
    "journal of pediatric gastroenterology and nutrition": 0.85,
    "gastrointestinal endoscopy": 0.75,
    "respiratory care": 0.65,
}

KEY_TERMS: tuple[str, ...] = (
    "aerodigestive",
    "pediatric airway",
    "laryngotracheal",
    "subglottic stenosis",
    "tracheoesophageal",
    "tracheomalacia",
    "laryngomalacia",
    "laryngeal cleft",
    "vocal fold paralysis",
    "esophageal atresia",
    "eosinophilic esophagitis",
    "fees",
    "videofluoroscopy",
    "supraglottoplasty",
    "slide tracheoplasty",
    "cricotracheal resection",
    "post-intubation",
    "extubation laryngitis",
)

PRIORITY_MESH: tuple[str, ...] = (
    "Airway Obstruction",
    "Larynx",
    "Trachea",
    "Deglutition Disorders",
    "Laryngostenosis",
    "Tracheal Stenosis",
    "Esophageal Atresia",
    "Tracheoesophageal Fistula",
    "Vocal Cord Paralysis",
    "Laryngomalacia",
    "Eosinophilic Esophagitis",
)


def journal_score(journal: str) -> float:
    if not journal:
        return 0.4
    return JOURNAL_TIER.get(journal.strip().lower(), 0.5)


def recency_score(pub_year: int | None, today: date | None = None) -> float:
    """Bonus para artigos publicados nos últimos 18 meses."""
    if pub_year is None:
        return 0.5
    today = today or date.today()
    age_days = max(0, (today - date(pub_year, 7, 1)).days)
    if age_days <= 90:
        return 1.0
    if age_days <= 365:
        return 0.85
    if age_days <= 730:
        return 0.6
    return 0.3


def keyword_score(text: str) -> float:
    if not text:
        return 0.0
    text_l = text.lower()
    hits = sum(1 for term in KEY_TERMS if term in text_l)
    # Saturação suave em 4 hits
    return min(1.0, hits / 4.0)


def mesh_score(mesh: Iterable[str]) -> float:
    if not mesh:
        return 0.0
    mesh_lower = {m.lower() for m in mesh}
    priority_lower = {m.lower() for m in PRIORITY_MESH}
    hits = len(mesh_lower & priority_lower)
    return min(1.0, hits / 3.0)


def score(article: dict) -> float:
    """Combina os fatores em [0, 1]."""
    j = journal_score(article.get("journal", ""))
    r = recency_score(article.get("year"))
    k = keyword_score(article.get("abstract", "") + " " + article.get("title", ""))
    m = mesh_score(article.get("mesh_terms", []))
    # Pesos: 0.35 journal, 0.20 recency, 0.25 keyword, 0.20 mesh
    return round(0.35 * j + 0.20 * r + 0.25 * k + 0.20 * m, 3)
