// Espelha aerodig-backend/models/schemas.py.
// Mantenha em sincronia com o backend.

export type Confidence = 'high' | 'moderate' | 'low';
export type Audience = 'pediatric' | 'adult' | 'both';
export type Domain =
  | 'larynx'
  | 'trachea'
  | 'esophagus'
  | 'swallowing'
  | 'sleep'
  | 'genetic'
  | 'vascular'
  | 'general';
export type AgeRange = 'neonate' | 'infant' | 'toddler' | 'school' | 'adolescent';

export interface Source {
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  url?: string;
  source_type?: 'guideline' | 'consensus' | 'primary' | 'review' | 'textbook' | 'institutional';
}

export interface Classification {
  name: string;
  author_year: string;
  description: string;
  pediatric_validated?: boolean;
  notes?: string;
}

export interface OutcomeSet {
  decannulation?: string | null;
  reintervention?: string | null;
  voice?: string | null;
  swallow?: string | null;
  complications?: string | null;
  followup?: string | null;
}

export interface BaseEntity {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  audience: Audience;
  confidence: Confidence;
  confidence_rationale: string;
  sources: Source[];
}

export interface Condition extends BaseEntity {
  domain: Domain;
  age_range: AgeRange[];
  summary: string;
  classifications: Classification[];
  red_flags: string[];
  key_exams: string[];
  common_pitfalls: string[];
  associated_pathways: string[];
  associated_procedures: string[];
  associated_instruments: string[];
  epidemiology_global?: string | null;
  epidemiology_brazil?: string | null;
}

export interface Pathway extends BaseEntity {
  entry_symptom: string;
  summary: string;
  nodes: { id: string; label: string; node_type: string; notes?: string }[];
  edges: { from_node: string; to_node: string; condition_label?: string }[];
  output_artifacts: string[];
}

export interface Instrument extends BaseEntity {
  instrument_type: 'screening' | 'functional' | 'outcome' | 'histologic' | 'endoscopic';
  domain: string;
  items_count?: number;
  interpretation: string;
  pediatric_validated: boolean;
  ptbr_validated: boolean;
  digital_calculator_available: boolean;
  notes?: string;
}

export interface Procedure extends BaseEntity {
  surgical: boolean;
  approach: 'endoscopic' | 'open' | 'adjuvant' | 'combined';
  indications: string[];
  contraindications: string[];
  technique_notes: string;
  outcome_set: OutcomeSet;
  learning_curve_evidence?: string;
  centers_high_volume: string[];
}

export interface FrontierItem extends BaseEntity {
  technology: 'ai' | '3d_printing' | 'genomics' | 'bioabsorbable' | 'biomarker' | 'tissue_engineering';
  maturity:
    | 'exploratory'
    | 'translational'
    | 'clinical_trial'
    | 'approved_specialized'
    | 'approved_widespread';
  summary: string;
  available_in_brazil: boolean;
  anvisa_status?: string;
  cost_signal: 'low' | 'medium' | 'high' | 'unknown';
}

export interface NetworkNode extends BaseEntity {
  node_type: 'center' | 'specialist' | 'course' | 'fellowship';
  country: string;
  city: string;
  institution: string;
  specialist_name?: string;
  focus_areas: string[];
  public_contact?: string;
  public_url?: string;
}

export interface NewsItem extends BaseEntity {
  pmid?: string;
  doi?: string;
  journal: string;
  pub_date?: string;
  abstract_en: string;
  summary_ptbr?: string;
  relevance_score: number;
  domain_tags: string[];
  status: 'pending' | 'published' | 'rejected' | 'archived';
}

export interface CalculatorInput {
  key: string;
  label: string;
  input_type: 'select' | 'number' | 'string';
  options?: string[];
  unit?: string;
  notes?: string;
}

export interface CalculatorOutput {
  key: string;
  label: string;
  unit?: string;
  notes?: string;
}

export interface Calculator extends BaseEntity {
  domain: string;
  summary: string;
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  formula_hint?: string;
  reference_table?: Record<string, string | null>[];
  notes_ptbr?: string;
}

export interface Event extends BaseEntity {
  event_type: 'congress' | 'course' | 'symposium' | 'webinar' | 'fellowship';
  organizer: string;
  location: string;
  starts_on: string;
  ends_on?: string;
  url: string;
  cme_credits?: number;
  target_audience: string[];
  registration_open: boolean;
  notes_ptbr?: string;
}

export interface SearchHit {
  entity_type:
    | 'condition'
    | 'pathway'
    | 'instrument'
    | 'procedure'
    | 'frontier'
    | 'network'
    | 'news'
    | 'event';
  slug: string;
  title_pt: string;
  title_en?: string;
  excerpt?: string;
  confidence?: Confidence;
}

export interface SearchResult {
  query: string;
  total: number;
  hits: SearchHit[];
}
