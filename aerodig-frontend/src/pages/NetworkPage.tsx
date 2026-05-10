import { useEffect, useState } from 'react';
import { fetchNetwork } from '../services/api';
import type { NetworkNode } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

export function NetworkPage() {
  const [items, setItems] = useState<NetworkNode[]>([]);
  useEffect(() => {
    fetchNetwork().then(setItems).catch(() => setItems([]));
  }, []);
  const brazil = items.filter((n) => n.country === 'Brasil');
  const others = items.filter((n) => n.country !== 'Brasil');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mapa de rede</h1>
      <p className="text-otto-muted text-sm mb-6">
        Centros e especialistas em medicina aerodigestiva — Brasil e mundo.
      </p>
      <Section title="Brasil" nodes={brazil} />
      <Section title="Internacional" nodes={others} />
    </div>
  );
}

function Section({ title, nodes }: { title: string; nodes: NetworkNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {nodes.map((n) => (
          <article key={n.slug} className="card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold">{n.title_pt}</h3>
              <ConfidenceBadge level={n.confidence} rationale={n.confidence_rationale} />
            </div>
            <p className="text-sm text-otto-muted">
              {n.institution} — {n.city}, {n.country}
            </p>
            {n.specialist_name && (
              <p className="text-sm mt-1">
                <strong>Referência:</strong> {n.specialist_name}
              </p>
            )}
            {n.focus_areas.length > 0 && (
              <ul className="text-xs text-otto-muted mt-2 list-disc pl-4">
                {n.focus_areas.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            {n.public_url && (
              <a
                href={n.public_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-otto-dark hover:underline mt-2 inline-block"
              >
                Site institucional ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
