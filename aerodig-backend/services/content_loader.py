"""
Content loader - le seeds JSON locais e valida com Pydantic.
"""
import json
import os
from pathlib import Path
from typing import Any, TypeVar

from pydantic import BaseModel

from models.schemas import (
    Calculator,
    Condition,
    Event,
    FrontierItem,
    Instrument,
    NetworkNode,
    NewsItem,
    Pathway,
    Procedure,
)

T = TypeVar("T", bound=BaseModel)

SEEDS_DIR = Path(__file__).parent.parent / "seeds"


def _load_dir(subdir: str, model: type[T]) -> list[T]:
    target = SEEDS_DIR / subdir
    if not target.exists():
        return []
    items: list[T] = []
    for path in sorted(target.glob("*.json")):
        with open(path, "r", encoding="utf-8") as fh:
            raw = json.load(fh)
        items.append(model.model_validate(raw))
    return items


def _load_file(filename: str, model: type[T]) -> list[T]:
    path = SEEDS_DIR / filename
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    if not isinstance(raw, list):
        raise ValueError(f"Seed {filename} deve conter um array no topo")
    return [model.model_validate(item) for item in raw]


def load_conditions() -> list[Condition]:
    return _load_dir("conditions", Condition)


def load_pathways() -> list[Pathway]:
    return _load_file("pathways.json", Pathway)


def load_instruments() -> list[Instrument]:
    return _load_file("instruments.json", Instrument)


def load_procedures() -> list[Procedure]:
    return _load_file("procedures.json", Procedure)


def load_frontier() -> list[FrontierItem]:
    return _load_file("frontier.json", FrontierItem)


def load_network() -> list[NetworkNode]:
    return _load_file("network-nodes.json", NetworkNode)


def load_events() -> list[Event]:
    return _load_file("events.json", Event)


def load_news() -> list[NewsItem]:
    return _load_file("news.json", NewsItem)


def load_calculators() -> list[Calculator]:
    return _load_file("calculators.json", Calculator)


def load_pubmed_queries() -> list[dict[str, Any]]:
    path = SEEDS_DIR / "pubmed-queries.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return data


def use_local_seeds() -> bool:
    return os.getenv("USE_LOCAL_SEEDS", "true").lower() == "true"
