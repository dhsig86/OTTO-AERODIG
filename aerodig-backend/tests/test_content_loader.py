"""Valida que todos os JSONs em seeds/ podem ser carregados e validados pelo Pydantic."""
from services.content_loader import (
    load_conditions,
    load_events,
    load_frontier,
    load_instruments,
    load_network,
    load_news,
    load_pathways,
    load_procedures,
    load_pubmed_queries,
)


def test_load_conditions():
    items = load_conditions()
    assert len(items) == 9
    slugs = {c.slug for c in items}
    assert "laringomalacia" in slugs


def test_load_pathways():
    items = load_pathways()
    assert len(items) == 3


def test_load_instruments():
    items = load_instruments()
    assert len(items) >= 12


def test_load_procedures():
    items = load_procedures()
    assert len(items) >= 8
    # outcome_set obrigatório
    for p in items:
        assert p.outcome_set is not None


def test_load_frontier():
    items = load_frontier()
    assert len(items) >= 6


def test_load_network():
    items = load_network()
    assert len(items) >= 7
    countries = {n.country for n in items}
    assert "Brasil" in countries


def test_load_events():
    items = load_events()
    assert len(items) >= 5


def test_load_news():
    items = load_news()
    assert len(items) >= 1


def test_load_pubmed_queries():
    queries = load_pubmed_queries()
    assert len(queries) >= 5
    for q in queries:
        assert "term" in q


def test_all_conditions_have_confidence_rationale():
    for c in load_conditions():
        assert c.confidence in ("high", "moderate", "low")
        assert c.confidence_rationale  # não vazio
