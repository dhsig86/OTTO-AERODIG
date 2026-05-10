from services import relevance_score as rs


def test_score_in_range():
    article = {
        "journal": "International Journal of Pediatric Otorhinolaryngology",
        "year": 2025,
        "title": "Pediatric airway and laryngomalacia review",
        "abstract": "We discuss aerodigestive pediatric airway and laryngomalacia outcomes.",
        "mesh_terms": ["Larynx", "Laryngomalacia", "Trachea"],
    }
    s = rs.score(article)
    assert 0.0 <= s <= 1.0
    # Artigo perfeitamente alinhado deve passar do threshold de curadoria (0.4)
    assert s >= 0.6


def test_low_relevance_article():
    article = {
        "journal": "Random Generic Journal",
        "year": 2010,
        "title": "Adult cardiology review",
        "abstract": "Heart failure outcomes in adults.",
        "mesh_terms": ["Heart Failure"],
    }
    s = rs.score(article)
    assert s < 0.5


def test_recency_boost():
    base = {
        "journal": "Laryngoscope",
        "title": "subglottic stenosis pediatric",
        "abstract": "subglottic stenosis pediatric airway",
        "mesh_terms": ["Larynx"],
    }
    recent = rs.score({**base, "year": 2025})
    old = rs.score({**base, "year": 2005})
    assert recent > old


def test_journal_tier():
    assert rs.journal_score("International Journal of Pediatric Otorhinolaryngology") == 1.0
    assert rs.journal_score("Unknown Journal") == 0.5
    assert rs.journal_score("") == 0.4
