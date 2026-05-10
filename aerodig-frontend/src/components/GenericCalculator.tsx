import { useMemo, useState } from 'react';
import type { Calculator } from '../types/content';

/**
 * Renderizador genérico de calculadora a partir de inputs/outputs declarativos.
 *
 * Para calculadoras com fórmula simples (soma, média), basta usar este componente.
 * Calculadoras com lógica especial (ex: TracheostomyConverter) têm componente dedicado.
 */
export function GenericCalculator({ calc }: { calc: Calculator }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const total = useMemo(() => {
    const numericInputs = calc.inputs.filter((i) => i.input_type === 'number');
    if (numericInputs.length === 0) return null;
    const sum = numericInputs.reduce((acc, inp) => {
      const v = parseFloat(values[inp.key] || '0');
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
    return sum;
  }, [calc, values]);

  function interpret(): string {
    if (calc.slug === 'pedi-eat-10-calc' && total !== null) {
      return total > 3 ? 'Sintomatologia significativa de disfagia (>3)' : 'Sem sintomatologia significativa (≤3)';
    }
    return '—';
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-1">{calc.title_pt}</h2>
      <p className="text-sm text-otto-muted mb-4">{calc.summary}</p>

      <div className="grid gap-3 md:grid-cols-2">
        {calc.inputs.map((inp) => (
          <label key={inp.key} className="block">
            <span className="text-sm font-medium">{inp.label}</span>
            {inp.input_type === 'select' && inp.options ? (
              <select
                className="mt-1 block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface"
                value={values[inp.key] || ''}
                onChange={(e) => setValues({ ...values, [inp.key]: e.target.value })}
              >
                <option value="">— selecione —</option>
                {inp.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={inp.input_type === 'number' ? 'number' : 'text'}
                className="mt-1 block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface"
                value={values[inp.key] || ''}
                onChange={(e) => setValues({ ...values, [inp.key]: e.target.value })}
                placeholder={inp.unit ? inp.unit : undefined}
              />
            )}
            {inp.notes && <span className="text-xs text-otto-muted">{inp.notes}</span>}
          </label>
        ))}
      </div>

      {total !== null && (
        <div className="rounded-xl bg-aerodig-soft border border-otto-border p-4 mt-5">
          <p className="text-sm text-otto-muted">Pontuação total</p>
          <p className="text-2xl font-bold text-otto-dark">{total}</p>
          <p className="text-sm mt-1">{interpret()}</p>
        </div>
      )}

      {calc.formula_hint && (
        <p className="text-xs text-otto-muted mt-3">
          <strong>Fórmula:</strong> {calc.formula_hint}
        </p>
      )}
    </div>
  );
}
