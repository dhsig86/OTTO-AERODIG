import { useEffect, useState } from 'react';
import { fetchProcedures } from '../services/api';
import type { Procedure } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

export function ProceduresPage() {
  const [items, setItems] = useState<Procedure[]>([]);
  useEffect(() => {
    fetchProcedures().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Procedimentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Outcome sets obrigatórios — decanulação, reintervenção, voz, deglutição, complicações,
        follow-up.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p) => (
          <article key={p.slug} className="card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-semibold">{p.title_pt}</h2>
              <ConfidenceBadge level={p.confidence} rationale={p.confidence_rationale} />
            </div>
            <p className="text-xs text-otto-muted italic mb-2">{p.title_en}</p>
            <div className="flex gap-2 text-xs mb-3">
              <span className="px-2 py-0.5 rounded-full bg-aerodig-soft text-aerodig-airway">
                {p.approach}
              </span>
              {p.surgical && (
                <span className="px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
                  cirúrgico
                </span>
              )}
            </div>
            {p.indications.length > 0 && (
              <p className="text-sm">
                <strong>Indicações:</strong> {p.indications.slice(0, 3).join(' · ')}
                {p.indications.length > 3 && ' …'}
              </p>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-otto-dark">
                Outcome set
              </summary>
              <ul className="mt-2 text-xs text-otto-muted space-y-1">
                {Object.entries(p.outcome_set)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <li key={k}>
                      <strong>{k}:</strong> {v}
                    </li>
                  ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
