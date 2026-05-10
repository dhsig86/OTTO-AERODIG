"""Fixtures pytest compartilhadas."""
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Garante que `aerodig-backend/` está no path para imports relativos (routers, services)
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Força modo seed local para todos os testes
os.environ["USE_LOCAL_SEEDS"] = "true"


@pytest.fixture(scope="session")
def client():
    """TestClient FastAPI compartilhado."""
    from main import app

    with TestClient(app) as c:
        yield c
