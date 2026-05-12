import { useState } from 'react';
import { Link } from 'react-router-dom';
import { search as searchApi } from '../services/api';
import type { SearchResult } from '../types/content';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TYPE_LABEL: Record<string, string> = {
  condition: 'Condicao',
  pathway: 'Pathway',
  instrument: 'Instrumento',
  procedure: 'Procedimento',
  frontier: 'Fronteira',
  network: 'Rede',
  news: 'News',
  event: 'Evento',
};

/** Retorna rota + state.highlight para deep-link no destino */
function resolveLink(entityType: string, slug: string): { to: string; state?: object } {
  switch (entityType) {
    case 'condition':
      return { to: `/atlas/${slug}` };
    case 'pathway':
      return { to: '/pathways', state: { highlight: slug } };
    case 'instrument':
      return { to: '/instruments', state: { highlight: slug } };
    case 'procedure':
      return { to: '/procedures', state: { highlight: slug } };
    case 'frontier':
      return { to: '/frontier' };
    case 'network':
      return { to: '/network' };
    case 'news':
      return { to: '/news' };
    case 'event':
      return { to: '/events' };
    default:
      return { to: '/' };
  }
}

export function SearchPage() {
  useDocumentTitle('Buscar');
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await searchApi(q.trim());
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Buscar</h1>
      <p className="text-otto-muted text-sm mb-6">
        Busca cross-camadas — Atlas, Pathways, Instrumentos, Procedimentos, Fronteira, Rede, News e
        Eventos.
      </p>

      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="estridor, fenda laríngea, EoE…"
          className="flex-1 border border-otto-border rounded-lg px-3 py-2 outline-none focus:border-otto-primary"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-otto-primary text-white text-sm hover:bg-otto-primary/80 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {result && (
        result.hits.length === 0 ? (
          <p className="text-otto-muted text-sm">Nenhum resultado para &ldquo;{result.query}&rdquo;.</p>
        ) : (
          <ul className="space-y-3">
            {result.hits.map((hit) => {
              const { to, state } = resolveLink(hit.entity_type, hit.slug);
              return (
                <li key={`${hit.entity_type}-${hit.slug}`}>
                  <Link
                    to={to}
                    state={state}
                    className="card block hover:border-otto-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm">{hit.title_pt}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-otto-light text-otto-muted shrink-0">
                        {TYPE_LABEL[hit.entity_type] ?? hit.entity_type}
                      </span>
                    </div>
                    {hit.excerpt && (
                      <p className="text-xs text-otto-muted line-clamp-2">{hit.excerpt}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
