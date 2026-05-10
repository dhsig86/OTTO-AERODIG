import { useEffect, useState } from 'react';
import { fetchPathways } from '../services/api';
import type { Pathway } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

export function PathwaysPage() {
  const [items, setItems] = useState<Pathway[]>([]);
  useEffect(() => {
    fetchPathways().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pathways de decisão</h1>
      <p className="text-otto-muted text-sm mb-6">
        Fluxos transversais — entrada por sintoma, saída por intervenção.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p) => (
          <div key={p.slug} className="card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-semibold">{p.title_pt}</h2>
              <ConfidenceBadge level={p.confidence} rationale={p.confidence_rationale} />
            </div>
            <p className="text-xs text-aerodig-airway mb-2">→ {p.entry_symptom}</p>
            <p className="text-sm text-otto-text/80">{p.summary}</p>
            <div className="text-xs text-otto-muted mt-2">
              {p.nodes.length} nós · {p.edges.length} transições
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
