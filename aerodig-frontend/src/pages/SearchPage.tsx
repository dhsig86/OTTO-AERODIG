import { useState } from 'react';
import { Link } from 'react-router-dom';
import { search as searchApi } from '../services/api';
import type { SearchResult } from '../types/content';

const ROUTE_BY_TYPE: Record<string, (slug: string) => string> = {
  condition: (s) => `/atlas/${s}`,
  pathway: () => `/pathways`,
  instrument: () => `/instruments`,
  procedure: () => `/procedures`,
  frontier: () => `/frontier`,
  network: () => `/network`,
  news: () => `/news`,
  event: () => `/events`,
};

export function SearchPage() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const r = await searchApi(q.trim());
    setResult(r);
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
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-otto-dark text-white text-sm hover:bg-otto-primary"
        >
          Buscar
        </button>
      </form>

      {result && (
        <p className="text-sm text-otto-muted mb-3">
          {result.total} resultado(s) para “{result.query}”
        </p>
      )}

      <ul className="space-y-3">
        {result?.hits.map((h) => (
          <li key={`${h.entity_type}-${h.slug}`} className="card">
            <p className="text-xs uppercase text-otto-muted mb-1">{h.entity_type}</p>
            <Link
              to={ROUTE_BY_TYPE[h.entity_type]?.(h.slug) ?? '/'}
              className="font-semibold hover:underline"
            >
              {h.title_pt}
            </Link>
            {h.excerpt && <p className="text-sm text-otto-text/80 mt-1">{h.excerpt}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
