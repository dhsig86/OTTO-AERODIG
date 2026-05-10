import { useEffect, useState } from 'react';
import { fetchNews } from '../services/api';
import type { NewsItem } from '../types/content';

export function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  useEffect(() => {
    fetchNews('published').then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">News</h1>
      <p className="text-otto-muted text-sm mb-6">
        Pipeline diário PubMed + revistas-chave + resumo PT-BR. Curadoria humana antes de publicar.
      </p>
      <div className="space-y-4">
        {items.map((n) => (
          <article key={n.slug} className="card">
            <header className="mb-1 flex items-center justify-between">
              <p className="text-xs text-aerodig-news">
                {n.journal} {n.pub_date ? `· ${n.pub_date}` : ''}
              </p>
              <p className="text-xs text-otto-muted">
                relevância {(n.relevance_score * 100).toFixed(0)}%
              </p>
            </header>
            <h2 className="font-semibold mb-1">{n.title_pt}</h2>
            <p className="text-xs text-otto-muted italic mb-2">{n.title_en}</p>
            {n.summary_ptbr && <p className="text-sm">{n.summary_ptbr}</p>}
            {n.pmid && (
              <a
                className="text-xs text-otto-dark hover:underline mt-2 inline-block"
                href={`https://pubmed.ncbi.nlm.nih.gov/${n.pmid}/`}
                target="_blank"
                rel="noreferrer"
              >
                PubMed ↗
              </a>
            )}
          </article>
        ))}
        {items.length === 0 && (
          <p className="text-otto-muted text-sm">
            Sem itens publicados ainda. O cron diário começará a popular esta página assim que o
            backend for implantado.
          </p>
        )}
      </div>
    </div>
  );
}
