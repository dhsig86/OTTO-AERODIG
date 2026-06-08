def test_list_calculators(client):
    r = client.get("/api/calculators")
    assert r.status_code == 200
    slugs = {c["slug"] for c in r.json()}
    assert "tracheostomy-tube-converter" in slugs
    assert "myer-cotton-calc" in slugs
    assert "pedi-eat-10-calc" in slugs


def test_tracheostomy_converter_has_reference_table(client):
    r = client.get("/api/calculators/tracheostomy-tube-converter")
    assert r.status_code == 200
    body = r.json()
    assert body["domain"] == "tracheostomy"
    assert len(body["reference_table"]) >= 20  # Tabela ampla
    # Deve cobrir as marcas principais
    brands = {row["brand"] for row in body["reference_table"]}
    assert "Shiley" in brands
    assert "Jackson (metalica)" in brands
    assert any("Bivona" in (b or "") for b in brands)


def test_calculator_has_sources(client):
    """Toda calculadora exibe ao menos 1 fonte (referências sempre disponíveis)."""
    r = client.get("/api/calculators")
    for c in r.json():
        assert len(c["sources"]) >= 1, f"Calculator {c['slug']} sem fontes"


def test_filter_calculators_by_domain(client):
    r = client.get("/api/calculators?domain=tracheostomy")
    body = r.json()
    assert all(c["domain"] == "tracheostomy" for c in body)


def test_get_unknown_calculator_404(client):
    r = client.get("/api/calculators/inexistente")
    assert r.status_code == 404
