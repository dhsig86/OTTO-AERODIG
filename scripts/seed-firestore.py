"""
Sincroniza seeds JSON locais → Firestore.

Uso:
    cd aerodig-backend
    python ../scripts/seed-firestore.py

Requer FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.
"""
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

ROOT = Path(__file__).resolve().parent.parent
SEEDS = ROOT / "aerodig-backend" / "seeds"

COLLECTIONS = {
    "conditions": SEEDS / "conditions",  # diretório de JSONs individuais
    "pathways": SEEDS / "pathways.json",
    "instruments": SEEDS / "instruments.json",
    "procedures": SEEDS / "procedures.json",
    "frontier": SEEDS / "frontier.json",
    "network_nodes": SEEDS / "network-nodes.json",
    "events": SEEDS / "events.json",
    "news_items": SEEDS / "news.json",
}


def init_firebase():
    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        print("ERROR: FIREBASE_SERVICE_ACCOUNT_JSON não está no ambiente.")
        sys.exit(1)
    cred = credentials.Certificate(json.loads(raw))
    firebase_admin.initialize_app(cred)
    return firestore.client()


def upload_dir(db, collection: str, dir_path: Path):
    count = 0
    for f in sorted(dir_path.glob("*.json")):
        with open(f, "r", encoding="utf-8") as fh:
            doc = json.load(fh)
        doc["updated_at"] = datetime.utcnow().isoformat()
        db.collection(collection).document(doc["id"]).set(doc, merge=True)
        count += 1
        print(f"  · {collection}/{doc['id']}")
    return count


def upload_array(db, collection: str, file_path: Path):
    if not file_path.exists():
        print(f"  ⚠ {file_path.name} não existe — pulando.")
        return 0
    with open(file_path, "r", encoding="utf-8") as fh:
        items = json.load(fh)
    count = 0
    for item in items:
        item["updated_at"] = datetime.utcnow().isoformat()
        db.collection(collection).document(item["id"]).set(item, merge=True)
        count += 1
        print(f"  · {collection}/{item['id']}")
    return count


def main():
    db = init_firebase()
    total = 0
    for collection, source in COLLECTIONS.items():
        print(f"=== {collection} ===")
        if source.is_dir():
            total += upload_dir(db, collection, source)
        else:
            total += upload_array(db, collection, source)
    print(f"\n✓ Total: {total} documentos sincronizados.")


if __name__ == "__main__":
    main()
