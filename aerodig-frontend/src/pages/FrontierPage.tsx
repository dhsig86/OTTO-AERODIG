import { useEffect, useState } from 'react';
import { fetchFrontier } from '../services/api';
import type { FrontierItem } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MATURITY_LABEL: Record<string, string> = {
  exploratory: 'Exploratório',
  translational: 'Translacional',
  clinical_trial: 'Ensaio clínico',
  approved_specialized: 'Aprovado (especializado)',
  approved_widespread: 'Aprovado (uso amplo)',
};

export function FrontierPage() {
  useDocumentTitle('Radar de fronteira');
  const [items, setItems] = useState<FrontierItem[]>([]);
  useEffect(() => {
    fetchFrontier().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Radar de fronteira</h1>
      <p className="text-otto-muted text-sm mb-6">
        Tecnologias emergentes — separadas explicitamente do padrão de cuidado.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((f) => (
          <article key={f.slug} className="card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-semibold">{f.title_pt}</h2>
              <ConfidenceBadge level={f.confidence} rationale={f.confidence_rationale} />
            </div>
            <div className="flex gap-2 text-xs mb-3">
              <span className="px-2 py-0.5 rounded-full bg-aerodig-frontier/10 text-aerodig-frontier">
                {f.technology}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
                {MATURITY_LABEL[f.maturity] ?? f.maturity}
              </span>
            </div>
            <p className="text-sm">{f.summary}</p>
            <p className="text-xs text-otto-muted mt-3">
              {f.available_in_brazil ? 'Disponível no Brasil' : 'Não disponível no Brasil'}
              {f.anvisa_status ? ` · ${f.anvisa_status}` : ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
