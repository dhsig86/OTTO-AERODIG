import { useMemo, useState } from 'react';
import type { Calculator } from '../types/content';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ReferencesPanel } from './ReferencesPanel';

/**
 * Mapa canônico age_band → expected_id_mm
 * Fonte: Myer CM, O'Connor DM, Cotton RT — Ann Otol Rhinol Laryngol 1994.
 * Usa o ponto médio clínico de cada faixa como referência para o cálculo.
 * A faixa exibida é para contexto clínico; confirmar com broncoscopia.
 *
 * ATENÇÃO: os rótulos das keys devem coincidir EXATAMENTE com os options
 * do input "patient_age_band" em calculators.json para esta calculadora.
 */
export const MYER_COTTON_EXPECTED: Record<string, { expected: number; range: string }> = {
  'Neonato':          { expected: 3.0, range: '2.5-3.5' },
  'Lactente (<6m)':   { expected: 3.5, range: '3.0-3.5' },
  'Lactente (6-12m)': { expected: 4.0, range: '3.5-4.0' },
  'Toddler (1-3a)':   { expected: 4.5, range: '4.0-4.5' },
  'Pre-escolar':      { expected: 5.0, range: '4.5-5.5' },
  'Escolar':          { expected: 6.0, range: '5.5-6.5' },
  'Adolescente':      { expected: 7.0, range: '6.5-7.5' },
};

export type MyerCottonResult = {
  gradeNum: 1 | 2 | 3 | 4;
  gradeLabel: string;
  reductionPct: number;
};

const GRADE_META: Record<
  number,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  1: {
    label: 'Grau I',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    desc: 'Redução ≤50% do lúmen. Manejo conservador na maioria dos casos; reavaliação seriada.',
  },
  2: {
    label: 'Grau II',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    desc: 'Redução 51–70%. Avaliação cirúrgica indicada; dilatação endoscópica ou LTR conforme contexto.',
  },
  3: {
    label: 'Grau III',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Redução 71–99%. Intervenção cirúrgica habitualmente necessária (LTR anterior/posterior, PCTR).',
  },
  4: {
    label: 'Grau IV',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    desc: 'Sem lúmen detectável. Traqueostomia presente ou reconstrução complexa necessária.',
  },
};

/**
 * Calcula grau Myer-Cotton a partir dos diâmetros internos.
 * Fórmula: reduction% = [1 − (observed / expected)²] × 100
 * Exportada separadamente para testes unitários.
 */
export function computeMyerCotton(
  observedMm: number,
  expectedMm: number,
): MyerCottonResult | null {
  if (!isFinite(observedMm) || !isFinite(expectedMm)) return null;
  if (observedMm < 0 || expectedMm <= 0) return null;
  // Tubo observado maior que esperado = sem estenose clinicamente relevante
  const clamped = Math.min(observedMm, expectedMm);
  const reductionPct = (1 - Math.pow(clamped / expectedMm, 2)) * 100;

  let gradeNum: 1 | 2 | 3;
  if (reductionPct <= 50) gradeNum = 1;
  else if (reductionPct <= 70) gradeNum = 2;
  else gradeNum = 3;

  return {
    gradeNum,
    gradeLabel: GRADE_META[gradeNum].label,
    reductionPct,
  };
}

export function MyCottonCalculator({ calc }: { calc: Calculator }) {
  const ageBands = Object.keys(MYER_COTTON_EXPECTED);
  const [ageBand, setAgeBand] = useState<string>(ageBands[0]);
  const [tubeInput, setTubeInput] = useState<string>('');
  const [noLumen, setNoLumen] = useState(false);

  const expected = MYER_COTTON_EXPECTED[ageBand] ?? MYER_COTTON_EXPECTED['Escolar'];

  const result = useMemo<MyerCottonResult | null>(() => {
    if (noLumen) {
      return { gradeNum: 4, gradeLabel: GRADE_META[4].label, reductionPct: 100 };
    }
    const v = parseFloat(tubeInput.replace(',', '.'));
    if (!tubeInput.trim() || isNaN(v)) return null;
    return computeMyerCotton(v, expected.expected);
  }, [tubeInput, ageBand, noLumen, expected]);

  const meta = result ? GRADE_META[result.gradeNum] : null;

  return (
    <div className="card">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-xl font-bold">{calc.title_pt}</h2>
        <ConfidenceBadge level={calc.confidence} rationale={calc.confidence_rationale} />
      </div>
      <p className="text-sm text-otto-muted mb-5">{calc.summary}</p>

      {/* Inputs */}
      <div className="grid gap-4 md:grid-cols-2 mb-5">
        <label className="block">
          <span className="text-sm font-medium block mb-1">Faixa etária</span>
          <select
            className="block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface text-sm"
            value={ageBand}
            onChange={(e) => {
              setAgeBand(e.target.value);
              setNoLumen(false);
            }}
            aria-label="Faixa etária"
          >
            {ageBands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="text-xs text-otto-muted mt-1 block">
            Tubo OT esperado:{' '}
            <strong className="text-otto-dark">{expected.expected.toFixed(1)} mm DI</strong>
            <span className="text-otto-muted"> (faixa {expected.range})</span>
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium block mb-1">
            Maior tubo OT sem vazamento (mm DI)
          </span>
          <input
            type="number"
            step="0.5"
            min="0"
            max="12"
            disabled={noLumen}
            className="block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface text-sm disabled:opacity-40"
            placeholder={`ex: ${expected.expected - 0.5}`}
            value={tubeInput}
            onChange={(e) => setTubeInput(e.target.value)}
            aria-label="Maior tubo endotraqueal que passa sem vazamento"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-otto-muted cursor-pointer">
            <input
              type="checkbox"
              checked={noLumen}
              onChange={(e) => {
                setNoLumen(e.target.checked);
                if (e.target.checked) setTubeInput('');
              }}
              className="rounded"
              aria-label="Grau IV — nenhum tubo passa"
            />
            Grau IV — nenhum tubo passa (sem lúmen detectável)
          </label>
        </label>
      </div>

      {/* Resultado */}
      {result && meta && (
        <div
          className={`rounded-xl border p-4 mb-5 animate-fade-in ${meta.bg} ${meta.border}`}
          data-testid="myer-cotton-result"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
            <span className={`text-2xl font-bold ${meta.color}`}>{meta.label}</span>
            {!noLumen && result.reductionPct < 100 && (
              <span className="text-sm text-otto-muted">
                — redução estimada{' '}
                <strong>{result.reductionPct.toFixed(1)}%</strong> da área transversal
              </span>
            )}
          </div>
          <p className={`text-sm ${meta.color}`}>{meta.desc}</p>
        </div>
      )}

      {/* Fórmula */}
      <p className="text-xs text-otto-muted mb-4">
        <strong>Fórmula:</strong>{' '}
        {calc.formula_hint ??
          'Reduction% = [1 − (tubo_observado / tubo_esperado)²] × 100'}
      </p>

      {/* Tabela de referência expandível */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium text-otto-dark">
          Tabela de referência — tubos OT esperados por faixa etária
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table
            className="w-full text-xs"
            aria-label="Tubos endotraqueais esperados por faixa etária (Myer-Cotton 1994)"
          >
            <thead className="text-left text-otto-muted border-b border-otto-border">
              <tr>
                <th className="py-1.5 pr-4 font-medium">Faixa etária</th>
                <th className="py-1.5 pr-4 font-medium">Esperado (mm DI)</th>
                <th className="py-1.5 font-medium">Faixa publicada</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MYER_COTTON_EXPECTED).map(
                ([band, { expected: exp, range }]) => (
                  <tr
                    key={band}
                    className={`border-t border-otto-border ${
                      band === ageBand ? 'bg-otto-light font-semibold' : ''
                    }`}
                  >
                    <td className="py-1.5 pr-4">{band}</td>
                    <td className="py-1.5 pr-4">{exp} mm</td>
                    <td className="py-1.5 text-otto-muted">{range} mm</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </details>

      <ReferencesPanel sources={calc.sources} className="mt-6" />
    </div>
 