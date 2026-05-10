EXPECTED_SLUGS = {
    "laringomalacia",
    "fenda-laringea",
    "estenose-subglotica",
    "lesao-pos-intubacao",
    "traqueomalacia",
    "estenose-traqueal-congenita",
    "atresia-esofago-fte",
    "disfagia-aspiracao",
    "eoe-drge-saos-pediatrico",
}


def test_list_conditions_returns_nine_seeds(client):
    r = client.get("/api/conditions")
    assert r.status_code == 200
    data = r.json()
    slugs = {c["slug"] for c in data}
    assert slugs == EXPECTED_SLUGS, f"Faltam ou sobram condições. Atual: {slugs}"


def test_get_laringomalacia(client):
    r = client.get("/api/conditions/laringomalacia")
    assert r.status_code == 200
    body = r.json()
    assert body["slug"] == "laringomalacia"
    assert body["domain"] == "larynx"
    assert body["confidence"] in {"high", "moderate", "low"}
    assert body["confidence_rationale"]
    # Pelo menos 1 classificação
    assert len(body["classifications"]) >= 1


def test_get_unknown_condition_returns_404(client):
    r = client.get("/api/conditions/inexistente")
    assert r.status_code == 404


def test_filter_by_domain(client):
    r = client.get("/api/conditions?domain=larynx")
    assert r.status_code == 200
    for c in r.json():
        assert c["domain"] == "larynx"


def test_all_conditions_have_required_fields(client):
    r = client.get("/api/conditions")
    for c in r.json():
        assert c["title_pt"]
        assert c["title_en"]
        assert c["confidence"] in {"high", "moderate", "low"}
        assert c["confidence_rationale"]
        assert isinstance(c["classifications"], list)
        assert isinstance(c["red_flags"], list)
        assert isinstance(c["key_exams"], list)
