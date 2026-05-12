import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchCondition,
  fetchPathways,
  fetchProcedures,
  fetchInstruments,
} from '../services/api';
import type { Condition, Pathway, Procedure, Instrument } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { GitBranch, Scissors, Ruler } from 'lucide-react';

export function ConditionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [c, setC] = useState<Condition | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Entidades relacionadas — carregadas em paralelo após a condition principal
  const [relPathways, setRelPathways] = useState<Pathway[]>([]);
  const [relProcedures, setRelProcedures] = useState<Procedure[]>([]);
  const [relInstruments, setRelInstruments] = useState<Instrument[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetchCondition(slug)
      .then(setC)
      .catch((e) => setError(e.message));
  }, [slug]);

  // Carrega relacionados assim que a condition (e seus slugs associados) chega
  useEffect(() => {
    if (!c) return;

    if (c.associated_pathways.length > 0) {
      fetchPathways()
        .then((all) => setRelPathways(all.filter((p) => c.associated_pathways.includes(p.slug))))
        .catch(() => {});
    }
    if (c.associated_procedures.length > 0) {
      fetchProcedures()
        .then((all) =>
          setRelProcedures(all.filter((p) => c.associated_procedures.includes(p.slug))),
        )
        .catch(() => {});
    }
    if (c.associated_instruments.length > 0) {
      fetchInstruments()
        .then((all) =>
          setRelInstruments(all.filter((i) => c.associated_instruments.includes(i.slug))),
        )
        .catch(() => {});
    }
  }, [c]);

  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!c) return <p className="text-otto-muted">Carregando…</p>;

  const hasRelated =
    relPathways.length > 0 || relProcedures.length > 0 || relInstruments.length > 0;

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
              <li key={rf} className="text-aerodig-flag">
                {rf}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {c.key_exams.length > 0 && (
        <Section title="Exames-chave">
          <ul>
            {c.key_exams.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Section>
      )}

      {c.common_pitfalls.length > 0 && (
        <Section title="Erros comuns">
          <ul>
            {c.common_pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      )}

      {(c.epidemiology_global || c.epidemiology_brazil) && (
        <Section title="Epidemiologia">
          {c.epidemiology_global && (
            <p>
              <strong>Global:</strong> {c.epidemiology_global}
            </p>
          )}
          {c.epidemiology_brazil && (
            <p>
              <strong>Brasil:</strong> {c.epidemiology_brazil}
            </p>
          )}
        </Section>
      )}

      {/* ── Seção de entidades relacionadas ───────────────────────────────── */}
      {hasRelated && (
        <Section title="Relacionados neste hub">
          <div className="not-prose space-y-4">
            {relPathways.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-aerodig-airway mb-2">
                  <GitBranch size={13} />
                  Pathways de decisão
                </p>
                <div className="flex flex-wrap gap-2">
                  {relPathways.map((p) => (
                    <Link
                      key={p.slug}
                      to="/pathways"
                      state={{ highlight: p.slug }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-aerodig-airway/30 bg-aerodig-soft text-sm text-aerodig-airway hover:border-aerodig-airway/70 transition-colors"
                    >
                      <GitBranch size={12} />
                      {p.title_pt}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relProcedures.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-otto-dark mb-2">
                  <Scissors size={13} />
                  Procedimentos
                </p>
                <div className="flex flex-wrap gap-2">
                  {relProcedures.map((p) => (
                    <Link
                      key={p.slug}
                      to="/procedures"
                      state={{ highlight: p.slug }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-otto-border bg-otto-light text-sm text-otto-dark hover:border-otto-primary/40 transition-colors"
                    >
                      <Scissors size={12} />
                      {p.title_pt}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relInstruments.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-otto-dark mb-2">
                  <Ruler size={13} />
                  Instrumentos / escalas
                </p>
                <div className="flex flex-wrap gap-2">
                  {relInstruments.map((i) => (
                    <Link
                      key={i.slug}
                      to="/instruments"
                      state={{ highlight: i.slug }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-otto-border bg-otto-light text-sm text-otto-dark hover:border-otto-primary/40 transition-colors"
                    >
                      <Ruler size={12} />
                      {i.title_pt}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
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
