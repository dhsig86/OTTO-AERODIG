import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchInstruments } from '../services/api';
import type { Instrument } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TYPE_LABEL: Record<string, string> = {
  screening: 'Triagem',
  functional: 'Funcional',
  outcome: 'Desfecho',
  histologic: 'Histológico',
  endoscopic: 'Endoscópico',
};

export function InstrumentsPage() {
  useDocumentTitle('Instrumentos');
  const [items, setItems] = useState<Instrument[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchInstruments()
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
      <h1 className="text-2xl font-bold mb-1">Instrumentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Escalas, scores e classificações — validacao pediátrica e PT-BR sinalizadas.
      </p>

      <div className="space-y-3">
        {items.map((i) => {
          const isOpen = expanded === i.slug;
          return (
            <div key={i.slug} className="card overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggle(i.slug)}
                aria-expanded={isOpen}
                aria-controls={`instrument-detail-${i.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h2 className="font-semibold text-base">{i.title_pt}</h2>
                      <ConfidenceBadge level={i.confidence} rationale={i.confidence_rationale} />
                      {i.pediatric_validated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                          Pediátrico ✓
                        </span>
                      )}
                      {i.ptbr_validated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                          PT-BR ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-otto-muted italic mb-1.5">{i.title_en}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-otto-light text-otto-muted">
                      {TYPE_LABEL[i.instrument_type] ?? i.instrument_type}
                    </span>
                  </div>
                  <span className="text-otto-muted mt-1 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div
                  id={`instrument-detail-${i.slug}`}
                  className="border-t border-otto-border pt-4 mt-0"
                >
                  <p className="text-sm mb-3">{i.interpretation}</p>
                  {i.notes && (
                    <p className="text-xs text-otto-muted mb-3">{i.notes}</p>
                  )}
                  {i.items_count != null && (
                    <p className="text-xs text-otto-muted mb-3">
                      Número de itens: <strong>{i.items_count}</strong>
                    </p>
                  )}
                  {i.digital_calculator_available && (
                    <p className="text-xs text-aerodig-airway mb-3">
                      Calculadora digital disponível neste hub.
                    </p>
                  )}
                  <ReferencesPanel sources={i.sources} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
