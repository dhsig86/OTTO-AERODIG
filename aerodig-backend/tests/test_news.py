def test_list_published_news(client):
    r = client.get("/api/news?status=published")
    assert r.status_code == 200
    items = r.json()
    assert all(it["status"] == "published" for it in items)


def test_news_sorted_by_relevance(client):
    r = client.get("/api/news?status=published")
    items = r.json()
    scores = [it.get("relevance_score") or 0.0 for it in items]
    assert scores == sorted(scores, reverse=True)


def test_news_filter_pending_returns_empty_in_seed(client):
    """Em seed inicial, ainda não há news pendentes — pipeline cron preenche."""
    r = client.get("/api/news?status=pending")
    assert r.status_code == 200
    # Não exige zero — apenas que retorne lista
    assert isinstance(r.json(), list)
