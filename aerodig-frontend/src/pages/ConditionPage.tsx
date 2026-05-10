import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchCondition,
  fetchPathways,
  fetchProcedures,
  fetchInstruments,
} from '../services/api';
import type { Condition, Pathway, Procedure, Instrument } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { GitBranch, Scissors, Ruler } from 'lucide-react';

export function ConditionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [c, setC] = useState<Condition | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Entidades relacionadas — carregadas em paralelo após a condition principal
  const [relPathways, setRelPathways] = useState<Pathway[]>([]);
  const [relProcedures, setRelProcedures] = useState<Procedure[]>([]);
  const [relInstruments, setRelInstruments] = useState<Instrument[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetchCondition(slug)
      .then(setC)
      .catch((e) => setError(e.message));
  }, [slug]);

  // Carrega relacionados assim que a condition (e seus slugs associados) chega
  useEffect(() => {
    if (!c) return;

    if (c.associated_pathways.length > 0) {
      fetchPathways()
        .then((all) => setRelPathways(all.filter((p) => c.associated_pathways.includes(p.slug))))
        .catch(() => {});
    }
    if (c.associated_procedures.length > 0) {
      fetchProcedures()
        .then((all) =>
          setRelProcedures(all.filter((p) => c.associated_procedures.includes(p.slug))),
        )
        .catch(() => {});
    }
    if (c.associated_instruments.length > 0) {
      fetchInstruments()
        .then((all) =>
          setRelInstruments(all.filter((i) => c.associated_instruments.includes(i.slug))),
        )
        .catch(() => {});
    }
  }, [c]);

  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!c) return <p className="text-otto-muted">Carregando…</p>;

  const hasRelated =
    relPathways.length > 0 || relProcedures.length > 0 || relInstruments.length > 0;

  return (
    <article className="prose prose-sm max-w-none">
      <Link to="/atlas" className="text-sm text-otto-muted hover:underline">
        ← Atlas
      </Link>
      <header className="mt-3 mb-5">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold m-0">{c.title_pt}</h1>
          <ConfidenceBadge level={c.confidence} rationale={c.confidence_rationale} />
        </div>
        <p className="text-otto-muted italic m-0">{c.title_en}</p>
      </header>

      <p className="text-base">{c.summary}</p>

      {c.classifications.length > 0 && (
        <Section title="Classificações vigentes">
          {c.classifications.map((cl) => (
            <div key={cl.name} className="card mb-3">
              <p className="font-semibold m-0">{cl.name}</p>
              <p className="text-xs text-otto-muted mb-1">{cl.author_year}</p>
              <p className="text-sm m-0">{cl.description}</p>
            </div>