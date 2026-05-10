"""
Pydantic schemas - modelo de conteudo do OTTO Aerodigestive Hub.
"""
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

Confidence = Literal["high", "moderate", "low"]
Audience = Literal["pediatric", "adult", "both"]
Domain = Literal[
    "larynx",
    "trachea",
    "esophagus",
    "swallowing",
    "sleep",
    "genetic",
    "vascular",
    "general",
]
AgeRange = Literal["neonate", "infant", "toddler", "school", "adolescent"]


class Source(BaseModel):
    title: str
    authors: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    pmid: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    source_type: Literal["guideline", "consensus", "primary", "review", "textbook", "institutional"] = "primary"


class Classification(BaseModel):
    name: str
    author_year: str
    description: str
    pediatric_validated: bool = True
    notes: Optional[str] = None


class OutcomeSet(BaseModel):
    decannulation: Optional[str] = None
    reintervention: Optional[str] = None
    voice: Optional[str] = None
    swallow: Optional[str] = None
    complications: Optional[str] = None
    followup: Optional[str] = None


class BaseEntity(BaseModel):
    id: str
    slug: str
    title_pt: str
    title_en: str
    audience: Audience = "pediatric"
    confidence: Confidence
    confidence_rationale: str
    sources: list[Source] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Condition(BaseEntity):
    domain: Domain
    age_range: list[AgeRange] = Field(default_factory=list)
    summary: str
    classifications: list[Classification] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    key_exams: list[str] = Field(default_factory=list)
    common_pitfalls: list[str] = Field(default_factory=list)
    associated_pathways: list[str] = Field(default_factory=list)
    associated_procedures: list[str] = Field(default_factory=list)
    associated_instruments: list[str] = Field(default_factory=list)
    epidemiology_global: Optional[str] = None
    epidemiology_brazil: Optional[str] = None


class PathwayNode(BaseModel):
    id: str
    label: str
    node_type: Literal["entry", "decision", "exam", "intervention", "outcome"]
    notes: Optional[str] = None


class PathwayEdge(BaseModel):
    from_node: str
    to_node: str
    condition_label: Optional[str] = None


class Pathway(BaseEntity):
    entry_symptom: str
    summary: str
    nodes: list[PathwayNode] = Field(default_factory=list)
    edges: list[PathwayEdge] = Field(default_factory=list)
    output_artifacts: list[str] = Field(default_factory=list)


class Instrument(BaseEntity):
    instrument_type: Literal["screening", "functional", "outcome", "histologic", "endoscopic"]
    domain: str
    items_count: Optional[int] = None
    interpretation: str
    pediatric_validated: bool
    ptbr_validated: bool
    digital_calculator_available: bool = False
    notes: Optional[str] = None


class Procedure(BaseEntity):
    surgical: bool
    approach: Literal["endoscopic", "open", "adjuvant", "combined"]
    indications: list[str] = Field(default_factory=list)
    contraindications: list[str] = Field(default_factory=list)
    technique_notes: str
    outcome_set: OutcomeSet
    learning_curve_evidence: Optional[str] = None
    centers_high_volume: list[str] = Field(default_factory=list)


class FrontierItem(BaseEntity):
    technology: Literal[
        "ai", "3d_printing", "genomics", "bioabsorbable", "biomarker", "tissue_engineering"
    ]
    maturity: Literal[
        "exploratory", "translational", "clinical_trial", "approved_specialized", "approved_widespread"
    ]
    summary: str
    available_in_brazil: bool
    anvisa_status: Optional[str] = None
    cost_signal: Literal["low", "medium", "high", "unknown"] = "unknown"


class NetworkNode(BaseEntity):
    node_type: Literal["center", "specialist", "course", "fellowship"]
    country: str
    city: str
    institution: str
    specialist_name: Optional[str] = None
    focus_areas: list[str] = Field(default_factory=list)
    public_contact: Optional[str] = None
    public_url: Optional[str] = None


class NewsItem(BaseEntity):
    pmid: Optional[str] = None
    doi: Optional[str] = None
    journal: str
    pub_date: Optional[date] = None
    abstract_en: str
    summary_ptbr: Optional[str] = None
    relevance_score: float = 0.0
    domain_tags: list[str] = Field(default_factory=list)
    status: Literal["pending", "published", "rejected", "archived"] = "pending"
    curator_uid: Optional[str] = None
    curator_notes: Optional[str] = None


class CalculatorInput(BaseModel):
    key: str
    label: str
    input_type: Literal["select", "number", "string"]
    options: Optional[list[str]] = None
    unit: Optional[str] = None
    notes: Optional[str] = None


class CalculatorOutput(BaseModel):
    key: str
    label: str
    unit: Optional[str] = None
    notes: Optional[str] = None


class Calculator(BaseEntity):
    domain: str
    summary: str
    inputs: list[CalculatorInput] = Field(default_factory=list)
    outputs: list[CalculatorOutput] = Field(default_factory=list)
    formula_hint: Optional[str] = None
    reference_table: Optional[list[dict[str, Optional[str]]]] = None
    notes_ptbr: Optional[str] = None


class Event(BaseEntity):
    event_type: Literal["congress", "course", "symposium", "webinar", "fellowship"]
    organizer: str
    location: str
    starts_on: date
    ends_on: Optional[date] = None
    url: str
    cme_credits: Optional[float] = None
    target_audience: list[str] = Field(default_factory=list)
    registration_open: bool = True
    notes_ptbr: Optional[str] = None


class SearchHit(BaseModel):
    entity_type: Literal[
        "condition", "pathway", "instrument", "procedure", "frontier", "network", "news", "event"
    ]
    slug: str
    title_pt: str
    title_en: Optional[str] = None
    excerpt: Optional[str] = None
    confidence: Optional[Confidence] = None


class SearchResult(BaseModel):
    query: str
    total: int
    hits: list[SearchHit]


class JobReport(BaseModel):
    job: str
    started_at: datetime
    finished_at: datetime
    items_fetched: int = 0
    items_persisted: int = 0
    errors: list[str] = Field(default_factory=list)
