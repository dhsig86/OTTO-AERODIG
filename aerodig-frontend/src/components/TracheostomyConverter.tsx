import { useMemo, useState } from 'react';
import type { Calculator } from '../types/content';

type Row = Record<string, string | null>;

export function TracheostomyConverter({ calc }: { calc: Calculator }) {
  const rows = (calc.reference_table || []) as Row[];
  const brands = useMemo(() => Array.from(new Set(rows.map((r) => r.brand))).filter(Boolean) as string[], [rows]);
  const [brand, setBrand] = useState<string>(brands[0] || '');
  const [size, setSize] = useState<string>('');

  const filtered = rows.filter((r) => r.brand === brand);
  const match = filtered.find((r) => (r.size || '').toLowerCase() === size.toLowerCase());

  // Equivalentes em outras marcas pelo DI mais próximo
  const equivalents: Row[] = useMemo(() => {
    if (!match || !match.id_mm) return [];
    const targetDi = parseFloat(match.id_mm);
    const others = rows.filter((r) => r.brand !== brand && r.id_mm);
    return others
      .map((r) => ({ ...r, _diff: Math.abs(parseFloat(r.id_mm!) - targetDi) }))
      .sort((a, b) => a._diff - b._diff)
      .slice(0, 6) as Row[];
  }, [match, rows, brand]);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-1">{calc.title_pt}</h2>
      <p className="text-sm text-otto-muted mb-4">{calc.summary}</p>

      <div className="grid gap-3 md:grid-cols-2 mb-5">
        <label className="block">
          <span className="text-sm font-medium">Marca</span>
          <select
            className="mt-1 block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setSize('');
            }}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Tamanho declarado</span>
          <select
            className="mt-1 block w-full border border-otto-border rounded-lg px-3 py-2 bg-otto-surface"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">— selecione —</option>
            {filtered.map((r) => (
              <option key={r.size || ''} value={r.size || ''}>
                {r.size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {match && (
        <div className="rounded-xl bg-aerodig-soft border border-otto-border p-4 mb-5">
          <p className="text-sm text-otto-muted mb-2">
            <strong>{brand}</strong> — {match.size} ({match.age_band})
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="DI" value={match.id_mm ? `${match.id_mm} mm` : '—'} />
            <Stat label="DE" value={match.od_mm ? `${match.od_mm} mm` : '—'} />
            <Stat label="French" value={match.french ? `${match.french} Fr` : '—'} />
          </div>
          {equivalents.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Equivalentes em outras marcas (por DI)</p>
              <ul className="text-sm space-y-1">
                {equivalents.map((e, i) => (
                  <li key={i}>
                    <strong>{e.brand}</strong> — {e.size} · DI {e.id_mm} mm · DE {e.od_mm || '—'} mm
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {calc.formula_hint && (
        <p className="text-xs text-otto-muted mb-3">
          <strong>Fórmula auxiliar:</strong> {calc.formula_hint}
        </p>
      )}
      {calc.notes_ptbr && (
        <p className="text-xs text-aerodig-flag/90 bg-aerodig-flag/5 border border-aerodig-flag/20 rounded-lg p-3">
          ⚠ {calc.notes_ptbr}
        </p>
      )}

      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-medium text-otto-dark">
          Ver tabela completa de referência ({rows.length} linhas)
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-otto-muted">
              <tr>
                <th className="py-1 pr-3">Marca</th>
                <th className="py-1 pr-3">Tamanho</th>
                <th className="py-1 pr-3">DI</th>
                <th className="py-1 pr-3">DE</th>
                <th className="py-1 pr-3">Fr</th>
                <th className="py-1 pr-3">Faixa etária</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-otto-border">
                  <td className="py-1 pr-3">{r.brand}</td>
                  <td className="py-1 pr-3">{r.size}</td>
                  <td className="py-1 pr-3">{r.id_mm}</td>
                  <td className="py-1 pr-3">{r.od_mm}</td>
                  <td className="py-1 pr-3">{r.french}</td>
                  <td className="py-1 pr-3">{r.age_band}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-otto-surface rounded-lg py-2">
      <p className="text-xs text-otto-muted">{label}</p>
      <p className="font-semibold text-otto-dark">{value}</p>
    </div>
  );
}
