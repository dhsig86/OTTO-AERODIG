import { useEffect, useState } from 'react';
import { fetchConditions } from '../services/api';
import type { Condition } from '../types/content';
import { ConditionCard } from '../components/ConditionCard';

export function AtlasPage() {
  const [items, setItems] = useState<Condition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConditions()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Atlas de condições</h1>
      <p className="text-otto-muted text-sm mb-6">
        Verbetes pediátricos com classificações vigentes, red flags, exames-chave e ledger de
        confiança explícito.
      </p>

      {loading && <p className="text-otto-muted">Carregando…</p>}
      {error && <p className="text-red-600">Erro: {error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <ConditionCard key={c.slug} c={c} />
        ))}
      </div>
    </div>
  );
}
