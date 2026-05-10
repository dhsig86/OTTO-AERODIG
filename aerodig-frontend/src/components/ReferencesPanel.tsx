import type { Source } from '../types/content';

interface Props {
  sources: Source[];
  className?: string;
  title?: string;
}

/**
 * Painel de referências/fontes — sempre visível para consulta.
 * Usado em ConditionPage, CalculatorsPage e qualquer lugar que precise expor fontes.
 */
export function ReferencesPanel({ sources, className = '', title = 'Referências' }: Props) {
  if (!sources || sources.length === 0) return null;
  return (
    <section className={`card ${className}`}>
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 text-sm">
        {sources.map((s, i) => (
          <li key={i} className="border-b border-otto-border last:border-0 pb-2 last:pb-0">
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-otto-muted">
              {[s.authors, s.journal, s.year ? String(s.year) : null]
                .filter(Boolean)
                .join(' · ')}
              {s.source_type ? ` · ${s.source_type}` : ''}
            </p>
            <div className="flex gap-3 text-xs mt-1">
              {s.pmid && (
                <a
                  className="text-otto-dark hover:underline"
                  href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  PubMed ↗
                </a>
              )}
              {s.doi && (
                <a
                  className="text-otto-dark hover:underline"
                  href={`https://doi.org/${s.doi}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  DOI ↗
                </a>
              )}
              {s.url && (
                <a
                  className="text-otto-dark hover:underline"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Site ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
