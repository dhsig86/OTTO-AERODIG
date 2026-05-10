def test_search_finds_laringomalacia(client):
    r = client.get("/api/search?q=laringomal")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] >= 1
    # Deve aparecer pelo menos um hit do tipo condition
    types = {h["entity_type"] for h in body["hits"]}
    assert "condition" in types


def test_search_finds_unicamp_in_network(client):
    r = client.get("/api/search?q=UNICAMP")
    body = r.json()
    types = {h["entity_type"] for h in body["hits"]}
    assert "network" in types


def test_search_empty_query(client):
    r = client.get("/api/search?q=")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 0


def test_search_cross_layers(client):
    r = client.get("/api/search?q=aspira")
    body = r.json()
    # Deve achar pelo menos 2 tipos diferentes (condition e pathway)
    types = {h["entity_type"] for h in body["hits"]}
    assert len(types) >= 2
