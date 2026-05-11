import { useMemo, useState } from 'react';
import type { Calculator } from '../types/content';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ReferencesPanel } from './ReferencesPanel';

/**
 * Pedi-EAT-10 — questionário de triagem de disfagia pediátrica (versão parental).
 * 10 itens de 0 (nunca) a 4 (sempre). Soma > 3 = sintomatologia significativa.
 *
 * Referência: Ghosh S. et al. adaptado; validacao PT-BR por Carvalho et al.
 */

const ITEMS = [
  'Engasga durante as refeicoes',
  'Tosse durante ou apos alimentacao',
  'Voz molhada (gorgolejo) apos deglutir',
  'Demora excessiva nas refeicoes (> 30 min)',
  'Recusa alimentar ou restricao de texturas',
  'Pneumonia recorrente ou broncoaspiracao confirmada',
  'Perda de peso ou falha de ganho ponderal',
  'Residuo oral pos-degluticao',
  'Sialorreia importante nao justificada',
  'Estresse familiar relacionado a alimentacao',
] as const;

const SCALE = [
  { value: 0, label: '0 — Nunca' },
  { value: 1, label: '1 — Raramente' },
  { value: 2, label: '2 — As vezes' },
  { value: 3, label: '3 — Frequente' },
  { value: 4, label: '4 — Sempre' },
];

export function PediEat10Calculator({ calc }: { calc: Calculator }) {
  const [scores, setScores] = useState<(number | null)[]>(Array(10).fill(null));

  const total = useMemo(() => {
    if (scores.some((s) => s === null)) return null;
    return scores.reduce<number>((acc, s) => acc + (s ?? 0), 0);
  }, [scores]);

  const allFilled = scores.every((s) => s !== null);
  const abnormal = total !== null && total > 3;

  function setScore(idx: number, val: number) {
    setScores((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  function reset() {
    setScores(Array(10).fill(null));
  }

  return (
    <div className="card">
      {/* Cabecalho */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-xl font-bold">{calc.title_pt}</h2>
        <ConfidenceBadge level={calc.confidence} rationale={calc.confidence_rationale} />
      </div>
      <p className="text-sm text-otto-muted mb-2">{calc.summary}</p>
      <p className="text-xs text-otto-muted mb-6">
        Responda baseando-se nos ultimos 4 semanas. Cada item: 0 = nunca / 4 = sempre.
      </p>

      {/* Itens */}
      <ol className="space-y-4 mb-6">
        {ITEMS.map((item, idx) => (
          <li key={idx} className="border border-otto-border rounded-lg p-3">
            <p className="text-sm font-medium mb-2.5">
              <span className="text-otto-muted mr-1.5">{idx + 1}.</span>
              {item}
            </p>
            <div className="flex flex-wrap gap-2">
              {SCALE.map(({ value, label }) => {
                const selected = scores[idx] === value;
                return (
                  <button
                    key={value}
                    onClick={() => setScore(idx, value)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      selected
                        ? 'bg-otto-dark text-white border-otto-dark'
                        : 'bg-otto-surface text-otto-muted border-otto-border hover:border-otto-primary/50',
                    ].join(' ')}
                    aria-pressed={selected}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {/* Resultado */}
      {allFilled && total !== null ? (
        <div
          className={[
            'rounded-xl border p-4 mb-5 animate-fade-in',
            abnormal
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className={`text-3xl font-bold ${abnormal ? 'text-red-700' : 'text-green-700'}`}>
              {total}
            </span>
            <span className={`text-sm font-semibold ${abnormal ? 'text-red-700' : 'text-green-700'}`}>
              / 40 pontos
            </span>
          </div>
          <p className={`text-sm font-medium ${abnormal ? 'text-red-700' : 'text-green-700'}`}>
            {abnormal
              ? 'Triagem POSITIVA — sintomatologia significativa de disfagia (escore > 3)'
              : 'Triagem NEGATIVA — sem sintomatologia significativa (escore ≤ 3)'}
          </p>
          <p className={`text-xs mt-1 ${abnormal ? 'text-red-600' : 'text-green-600'}`}>
            {abnormal
              ? 'Encaminhar para avaliacao fonoaudiologica especializada e rastreio de aspiracao.'
              : 'Reavaliar se houver mudanca clinica ou ganho ponderal insatisfatorio.'}
          </p>
        </div>
      ) : (
        <p className="text-xs text-otto-muted italic mb-5">
          Preencha todos os 10 itens para ver o resultado.{' '}
          {scores.filter((s) => s !== null).length}/10 preenchidos.
        </p>
      )}

      {/* Reset */}
      {scores.some((s) => s !== null) && (
        <button
          onClick={reset}
          className="text-xs text-otto-muted hover:text-otto-dark underline mb-5"
        >
          Limpar respostas
        </button>
      )}

      {/* Nota metodologica */}
      <div className="text-xs text-otto-muted space-y-1 mb-4 p-3 bg-otto-bg rounded-lg">
        <p>
          <strong>Interpretacao:</strong> Escore &gt; 3 indica necessidade de avaliacao
          fonoaudiologica. Nao substitui avaliacao clinica completa.
        </p>
        <p>
          <strong>Populacao:</strong> Criancas de 2 meses a 10 anos; aplicado por
          responsavel.
        </p>
      </div>

      <ReferencesPanel sources={calc.sources} className="mt-2" />
    </div>
  );
}
