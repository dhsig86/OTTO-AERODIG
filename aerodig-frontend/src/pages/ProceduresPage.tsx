import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchProcedures } from '../services/api';
import type { Procedure } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const OUTCOME_LABEL: Record<string, string> = {
  decannulation: 'Decanulacao',
  reintervention: 'Reintervencao',
  voice: 'Voz',
  swallow: 'Degluticao',
  complications: 'Complicacoes',
  followup: 'Follow-up',
};

export function ProceduresPage() {
  useDocumentTitle('Procedimentos');
  const [items, setItems] = useState<Procedure[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchProcedures()
      .then((data) => {
        setItems(data);
        const highlighted = (location.state as { highlight?: string } | null)?.highlight;
        if (highlighted) setExpanded(highlighted);
      })
      .catch(() => setItems([]));
  }, [location.state]);

  function toggle(slug: string) {
    setExpanded((prev) => (prev === slug ? null : slug));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Procedimentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Outcome sets obrigatórios — decanulacao, reintervencao, voz, degluticao, complicacoes,
        follow-up.
      </p>

      <div className="space-y-3">
        {items.map((p) => {
          const isOpen = expanded === p.slug;
          return (
            <div key={p.slug} className="card overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggle(p.slug)}
                aria-expanded={isOpen}
                aria-controls={`procedure-detail-${p.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h2 className="font-semibold text-base">{p.title_pt}</h2>
                      <ConfidenceBadge level={p.confidence} rationale={p.confidence_rationale} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-otto-light text-otto-muted font-medium capitalize">
                        {p.approach}
                      </span>
                    </div>
                    <p className="text-xs text-otto-muted italic mb-1.5">{p.title_en}</p>
                  </div>
                  <span className="text-otto-muted mt-1 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div
                  id={`procedure-detail-${p.slug}`}
                  className="border-t border-otto-border pt-4 mt-0"
                >
                  {p.technique_notes && (
                    <p className="text-sm mb-4">{p.technique_notes}</p>
                  )}

                  {p.indications.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-otto-muted mb-1">
                        Indicações
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {p.indications.map((ind) => (
                          <li key={ind} className="text-sm">{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.contraindications.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-aerodig-flag mb-1">
                        Contraindicações
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {p.contraindications.map((ci) => (
                          <li key={ci} className="text-sm text-aerodig-flag">{ci}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Outcome set */}
                  {Object.keys(p.outcome_set).length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-otto-muted mb-2">
                        Outcomes monitorados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.outcome_set)
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="text-xs px-2 py-1 rounded-lg border border-otto-border bg-otto-light"
                            >
                              <span className="font-medium text-otto-dark">
                                {OUTCOME_LABEL[k] ?? k}:
                              </span>{' '}
                              <span className="text-otto-muted">{v}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {p.learning_curve_evidence && (
                    <p className="text-xs text-otto-muted mb-3">
                      <strong>Curva de aprendizado:</strong> {p.learning_curve_evidence}
                    </p>
                  )}

                  {p.centers_high_volume.length > 0 && (
                    <p className="text-xs text-otto-muted mb-3">
                      <strong>Centros de alto volume:</strong>{' '}
                      {p.centers_high_volume.join(', ')}
                    </p>
                  )}

                  <ReferencesPanel sources={p.sources} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
