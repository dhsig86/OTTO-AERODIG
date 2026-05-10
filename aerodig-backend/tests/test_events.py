from datetime import date


def test_events_are_upcoming(client):
    r = client.get("/api/events?upcoming=true")
    assert r.status_code == 200
    today = date.today()
    for e in r.json():
        end_or_start = e.get("ends_on") or e["starts_on"]
        assert end_or_start >= today.isoformat(), (
            f"Evento {e['slug']} já passou mas foi listado em upcoming."
        )


def test_events_sorted_by_starts_on(client):
    r = client.get("/api/events?upcoming=true")
    starts = [e["starts_on"] for e in r.json()]
    assert starts == sorted(starts)


def test_filter_event_type(client):
    r = client.get("/api/events?event_type=congress")
    for e in r.json():
        assert e["event_type"] == "congress"
