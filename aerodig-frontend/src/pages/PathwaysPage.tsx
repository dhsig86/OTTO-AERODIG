import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPathways } from '../services/api';
import type { Pathway } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { PathwayDiagram } from '../components/PathwayDiagram';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function PathwaysPage() {
  useDocumentTitle('Pathways de decisao');
  const [items, setItems] = useState<Pathway[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchPathways()
      .then((data) => {
        setItems(data);
        // Auto-expande se vier de cross-link com state.highlight
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
      <h1 className="text-2xl font-bold mb-1">Pathways de decisao</h1>
      <p className="text-otto-muted text-sm mb-6">
        Fluxos transversais — entrada por sintoma, saida por intervencao. Clique em um pathway
        para abrir o diagrama de decisao clinica.
      </p>

      <div className="space-y-4">
        {items.map((p) => {
          const isOpen = expanded === p.slug;
          return (
            <div key={p.slug} className="card overflow-hidden">
              {/* Cabecalho clicavel */}
              <button
                className="w-full text-left"
                onClick={() => toggle(p.slug)}
                aria-expanded={isOpen}
                aria-controls={`pathway-diagram-${p.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-semibold text-base">{p.title_pt}</h2>
                      <ConfidenceBadge level={p.confidence} rationale={p.confidence_rationale} />
                    </div>
                    <p className="text-xs text-aerodig-airway mb-1.5">
                      Entrada: <strong>{p.entry_symptom}</strong>
                    </p>
                    <p className="text-sm text-otto-text/80">{p.summary}</p>
                    <p className="text-xs text-otto-muted mt-1.5">
                      {p.nodes.length} nos · {p.edges.length} transicoes
                    </p>
                  </div>
                  <span className="text-otto-muted mt-0.5 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </button>

              {/* Diagrama SVG — monta ao abrir */}
              {isOpen && (
                <div
                  id={`pathway-diagram-${p.slug}`}
                  className="mt-5 animate-fade-in"
                >
                  {/* overflow-x-auto garante scroll horizontal em mobile */}
                  <div className="overflow-x-auto">
                    <PathwayDiagram nodes={p.nodes} edges={p.edges} />
                  </div>

                  {p.output_artifacts.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-otto-muted font-medium">Saidas:</span>
                      {p.output_artifacts.map((a) => (
                        <span
                          key={a}
                          className="text-xs px-2.5 py-0.5 rounded-full bg-aerodig-soft text-aerodig-airway border border-aerodig-airway/20"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
