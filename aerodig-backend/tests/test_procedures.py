REQUIRED_OUTCOME_KEYS = {
    "decannulation",
    "reintervention",
    "voice",
    "swallow",
    "complications",
    "followup",
}


def test_all_procedures_have_outcome_set(client):
    r = client.get("/api/procedures")
    assert r.status_code == 200
    for p in r.json():
        assert "outcome_set" in p
        keys = set(p["outcome_set"].keys())
        # Todos os campos esperados devem existir (mesmo que None)
        assert REQUIRED_OUTCOME_KEYS.issubset(keys), (
            f"Outcome set incompleto em {p['slug']}: faltam {REQUIRED_OUTCOME_KEYS - keys}"
        )


def test_slide_tracheoplasty(client):
    r = client.get("/api/procedures/slide-tracheoplasty")
    assert r.status_code == 200
    body = r.json()
    assert body["surgical"] is True
    assert body["approach"] == "open"
    assert body["confidence"] == "high"


def test_supraglotoplasty_indications(client):
    r = client.get("/api/procedures/supraglotoplastia")
    assert r.status_code == 200
    body = r.json()
    assert any("laringomalácia" in i.lower() for i in body["indications"])
