"""
Firebase Admin client — initialization helper.

Quando USE_LOCAL_SEEDS=true (dev), as funções aqui retornam None e os routers
usam o `services.content_loader` para ler diretamente os JSONs em seeds/.
"""
import json
import os
from typing import Any, Optional

import firebase_admin
from firebase_admin import auth, credentials, firestore

_app: Optional[firebase_admin.App] = None
_db: Any = None


def _init_app() -> Optional[firebase_admin.App]:
    """Inicializa Firebase Admin a partir do JSON de service account."""
    global _app
    if _app is not None:
        return _app

    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None

    try:
        info = json.loads(raw)
        cred = credentials.Certificate(info)
        _app = firebase_admin.initialize_app(cred)
        return _app
    except Exception as exc:  # pragma: no cover
        print(f"[firebase_db] Failed to init: {exc}")
        return None


def get_db() -> Any:
    """Retorna client Firestore — None em dev sem credenciais."""
    global _db
    if _db is not None:
        return _db
    if _init_app() is None:
        return None
    _db = firestore.client()
    return _db


def verify_token(id_token: str) -> Optional[dict]:
    """Valida Firebase ID token. Retorna decoded dict ou None."""
    if _init_app() is None:
        return None
    try:
        return auth.verify_id_token(id_token)
    except Exception:
        return None


def is_curator(decoded: Optional[dict]) -> bool:
    """Custom claim 'role' == 'curator'."""
    if not decoded:
        return False
    return decoded.get("role") == "curator"
