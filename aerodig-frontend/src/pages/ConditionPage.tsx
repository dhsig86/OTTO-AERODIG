import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCondition } from '../services/api';
import type { Condition } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';

export function ConditionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [c, setC] = useState<Condition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchCondition(slug)
      .then(setC)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!c) return <p className="text-otto-muted">Carregando…</p>;

  return (
    <article className="prose prose-sm max-w-none">
      <Link to="/atlas" className="text-sm text-otto-muted hover:underline">
        ← Atlas
      </Link>
      <header className="mt-3 mb-5">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold m-0">{c.title_pt}</h1>
          <ConfidenceBadge level={c.confidence} rationale={c.confidence_rationale} />
        </div>
        <p className="text-otto-muted italic m-0">{c.title_en}</p>
      </header>

      <p className="text-base">{c.summary}</p>

      {c.classifications.length > 0 && (
        <Section title="Classificações vigentes">
          {c.classifications.map((cl) => (
            <div key={cl.name} className="card mb-3">
              <p className="font-semibold m-0">{cl.name}</p>
              <p className="text-xs text-otto-muted mb-1">{cl.author_year}</p>
              <p className="text-sm m-0">{cl.description}</p>
            </div>
          ))}
        </Section>
      )}

      {c.red_flags.length > 0 && (
        <Section title="Red flags">
          <ul>
            {c.red_flags.map((rf) => (
              <li key={rf} className="text-aerodig-flag">{rf}</li>
            ))}
          </ul>
        </Section>
      )}

      {c.key_exams.length > 0 && (
        <Section title="Exames-chave">
          <ul>{c.key_exams.map((e) => <li key={e}>{e}</li>)}</ul>
        </Section>
      )}

      {c.common_pitfalls.length > 0 && (
        <Section title="Erros comuns">
          <ul>{c.common_pitfalls.map((p) => <li key={p}>{p}</li>)}</ul>
        </Section>
      )}

      {(c.epidemiology_global || c.epidemiology_brazil) && (
        <Section title="Epidemiologia">
          {c.epidemiology_global && <p><strong>Global:</strong> {c.epidemiology_global}</p>}
          {c.epidemiology_brazil && <p><strong>Brasil:</strong> {c.epidemiology_brazil}</p>}
        </Section>
      )}

      <ReferencesPanel sources={c.sources} className="mt-6" title="Referências" />
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold border-b border-otto-border pb-1 mb-3">{title}</h2>
      {children}
    </section>
  );
}
