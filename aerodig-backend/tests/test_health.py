def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["service"] == "otto-aerodig-api"


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "service" in r.json()


def test_iframe_headers(client):
    r = client.get("/health")
    assert "X-Frame-Options" in r.headers
    csp = r.headers.get("Content-Security-Policy", "")
    assert "frame-ancestors" in csp
