REQUIRED_SLUGS = {
    "myer-cotton",
    "benjamin-inglis",
    "cali",
    "pedi-eat-10",
    "fois-pediatrico",
    "fees-pediatrico",
    "psq-srbd",
    "osa-18",
    "erefs",
    "i-gerq-r",
    "derkay",
    "i-see",
}


def test_list_instruments(client):
    r = client.get("/api/instruments")
    assert r.status_code == 200
    slugs = {i["slug"] for i in r.json()}
    missing = REQUIRED_SLUGS - slugs
    assert not missing, f"Instrumentos obrigatórios ausentes: {missing}"


def test_get_pedi_eat_10(client):
    r = client.get("/api/instruments/pedi-eat-10")
    assert r.status_code == 200
    body = r.json()
    assert body["pediatric_validated"] is True
    assert body["ptbr_validated"] is True
    assert body["domain"] == "swallowing"
