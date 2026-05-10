import { useEffect, useState } from 'react';
import { fetchCalculators } from '../services/api';
import type { Calculator } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { TracheostomyConverter } from '../components/TracheostomyConverter';
import { GenericCalculator } from '../components/GenericCalculator';
import { MyCottonCalculator } from '../components/MyCottonCalculator';
import { ReferencesPanel } from '../components/ReferencesPanel';

export function CalculatorsPage() {
  const [items, setItems] = useState<Calculator[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    fetchCalculators().then(setItems).catch(() => setItems([]));
  }, []);

  const current = items.find((c) => c.slug === active);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Calculadoras</h1>
      <p className="text-otto-muted text-sm mb-6">
        Ferramentas interativas — conversão de cânulas de traqueostomia, scores e fórmulas
        clínicas. Toda calculadora exibe fontes e ledger de confiança.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActive(c.slug === active ? null : c.slug)}
            className={[
              'card text-left transition-all',
              c.slug === active ? 'border-otto-primary ring-2 ring-otto-primary/20' : '',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-semibold">{c.title_pt}</h2>
              <ConfidenceBadge level={c.confidence} rationale={c.confidence_rationale} />
            </div>
            <p className="text-xs text-otto-muted italic mb-2">{c.title_en}</p>
            <p className="text-sm text-otto-text/80 line-clamp-3">{c.summary}</p>
            <span className="mt-3 inline-block text-xs px-2 py-0.5 rounded-full bg-aerodig-soft text-aerodig-airway">
              {c.domain}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <section className="mt-8 animate-fade-in">
          {current.slug === 'tracheostomy-tube-converter' ? (
            <TracheostomyConverter calc={current} />
          ) : current.slug === 'myer-cotton-calc' ? (
            <MyCottonCalculator calc={current} />
          ) : (
      