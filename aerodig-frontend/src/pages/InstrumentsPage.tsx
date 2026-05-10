import { useEffect, useState } from 'react';
import { fetchInstruments } from '../services/api';
import type { Instrument } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

export function InstrumentsPage() {
  const [items, setItems] = useState<Instrument[]>([]);
  useEffect(() => {
    fetchInstruments().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Instrumentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Escalas, scores e classificações com validação pediátrica e PT-BR sinalizadas.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => (
          <div key={i.slug} className="card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-semibold">{i.title_pt}</h2>
              <ConfidenceBadge level={i.confidence} rationale={i.confidence_rationale} />
            </div>
            <p className="text-xs text-otto-muted italic mb-2">{i.title_en}</p>
            <p className="text-sm">{i.interpretation}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
                {i.instrument_type}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-aerodig-soft text-aerodig-airway">
                {i.domain}
              </span>
              {i.pediatric_validated && (
                <span className="px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
                  pediátrico
                </span>
              )}
              {i.ptbr_validated && (
                <span className="px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
                  PT-BR
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
