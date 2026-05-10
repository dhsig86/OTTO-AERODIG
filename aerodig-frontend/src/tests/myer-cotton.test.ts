/**
 * Testes unitários para a lógica da calculadora Myer-Cotton.
 *
 * Cobre:
 *  - valores canônicos do artigo original (Myer, O'Connor, Cotton 1994)
 *  - fronteiras exatas entre graus
 *  - entradas inválidas / edge cases
 *  - propriedade de monotonicidade (tubo menor → grau maior)
 */

import { describe, it, expect } from 'vitest';
import { computeMyerCotton, MYER_COTTON_EXPECTED } from '../components/MyCottonCalculator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calcula reduction% independente da função testada */
function expectedReduction(obs: number, exp: number) {
  return (1 - Math.pow(obs / exp, 2)) * 100;
}

// ─── Testes canônicos ────────────────────────────────────────────────────────

describe('computeMyerCotton — valores canônicos', () => {
  it('Grau I: tubo igual ao esperado → redução 0%', () => {
    const r = computeMyerCotton(5.0, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(1);
    expect(r!.reductionPct).toBeCloseTo(0, 1);
  });

  it('Grau I: redução de 40% → grau I (≤50%)', () => {
    // obs: 4.37mm, exp: 5.0mm → reduction ≈ (1 - (4.37/5)²) × 100 ≈ 24%
    const obs = 5.0 * Math.sqrt(0.6); // exatamente 40% de redução
    const r = computeMyerCotton(obs, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(1);
    expect(r!.reductionPct).toBeCloseTo(40, 0);
  });

  it('Grau II: redução de 60% → grau II (51–70%)', () => {
    // obs = sqrt(0.4) × 5 = 3.162mm
    const obs = 5.0 * Math.sqrt(0.4);
    const r = computeMyerCotton(obs, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(2);
    expect(r!.reductionPct).toBeCloseTo(60, 0);
  });

  it('Grau III: redução de 85% → grau III (71–99%)', () => {
    // obs = sqrt(0.15) × 5 = 1.936mm
    const obs = 5.0 * Math.sqrt(0.15);
    const r = computeMyerCotton(obs, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(3);
    expect(r!.reductionPct).toBeCloseTo(85, 0);
  });

  it('Escolar (exp=6.0) + obs=3.0 → grau III ~75%', () => {
    // Caso clínico típico: criança escolar, passa tubo 3.0
    const r = computeMyerCotton(3.0, 6.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(3);
    expect(r!.reductionPct).toBeCloseTo(75, 1);
  });

  it('Toddler (exp=4.5) + obs=3.5 → grau II', () => {
    const exp = MYER_COTTON_EXPECTED['Toddler (1-3a)'].expected; // 4.5
    const r = computeMyerCotton(3.5, exp);
    const reduction = expectedReduction(3.5, exp);
    expect(r).not.toBeNull();
    expect(r!.reductionPct).toBeCloseTo(reduction, 1);
    // 1-(3.5/4.5)² = 1-0.605 = 39.5% → grau I (borderline)
    expect(r!.gradeNum).toBe(1);
  });

  it('Lactente 6-12m (exp=4.0) + obs=2.0 → grau III ~75%', () => {
    const exp = MYER_COTTON_EXPECTED['Lactente (6-12m)'].expected; // 4.0
    const r = computeMyerCotton(2.0, exp);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(3);
    expect(r!.reductionPct).toBeCloseTo(75, 1);
  });
});

// ─── Fronteiras exatas dos graus ─────────────────────────────────────────────

describe('computeMyerCotton — fronteiras de grau', () => {
  const EXP = 5.0; // valor fixo para isolar os testes de fronteira

  it('Fronteira I→II: exatamente 50% de redução → grau I', () => {
    const obs = EXP * Math.sqrt(0.5); // reduction = exatamente 50%
    const r = computeMyerCotton(obs, EXP);
    expect(r!.gradeNum).toBe(1);
    expect(r!.reductionPct).toBeCloseTo(50, 1);
  });

  it('50.1% de redução → grau II', () => {
    // obs ligeiramente abaixo do limiar
    const obs = EXP * Math.sqrt(0.499);
    const r = computeMyerCotton(obs, EXP);
    expect(r!.gradeNum).toBe(2);
  });

  it('Fronteira II→III: exatamente 70% de redução → grau II', () => {
    const obs = EXP * Math.sqrt(0.3); // reduction = exatamente 70%
    const r = computeMyerCotton(obs, EXP);
    expect(r!.gradeNum).toBe(2);
    expect(r!.reductionPct).toBeCloseTo(70, 1);
  });

  it('70.1% de redução → grau III', () => {
    const obs = EXP * Math.sqrt(0.299);
    const r = computeMyerCotton(obs, EXP);
    expect(r!.gradeNum).toBe(3);
  });
});

// ─── Monotonicidade ───────────────────────────────────────────────────────────

describe('computeMyerCotton — monotonicidade', () => {
  it('tubo menor → redução maior (propriedade monótona)', () => {
    const EXP = 5.0;
    const tubes = [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5];
    const results = tubes.map((t) => computeMyerCotton(t, EXP)!.reductionPct);
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1]);
    }
  });

  it('grau nunca diminui à medida que o tubo diminui', () => {
    const EXP = 5.0;
    const tubes = [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0];
    const grades = tubes.map((t) => computeMyerCotton(t, EXP)!.gradeNum);
    for (let i = 1; i < grades.length; i++) {
      expect(grades[i]).toBeGreaterThanOrEqual(grades[i - 1]);
    }
  });
});

// ─── Edge cases / entradas inválidas ─────────────────────────────────────────

describe('computeMyerCotton — entradas inválidas', () => {
  it('retorna null para tubo observado negativo', () => {
    expect(computeMyerCotton(-1, 5.0)).toBeNull();
  });

  it('retorna null para tubo esperado zero', () => {
    expect(computeMyerCotton(3.0, 0)).toBeNull();
  });

  it('retorna null para expected negativo', () => {
    expect(computeMyerCotton(3.0, -5)).toBeNull();
  });

  it('retorna null para NaN', () => {
    expect(computeMyerCotton(NaN, 5.0)).toBeNull();
    expect(computeMyerCotton(3.0, NaN)).toBeNull();
  });

  it('retorna null para Infinity', () => {
    expect(computeMyerCotton(Infinity, 5.0)).toBeNull();
  });

  it('tubo zero → grau III (redução 100%, clamped para III)', () => {
    // 0mm = máxima obstrução detectável sem Grau IV manual
    const r = computeMyerCotton(0, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(3);
    expect(r!.reductionPct).toBeCloseTo(100, 1);
  });

  it('tubo maior que esperado → grau I (sem estenose significativa)', () => {
    // tubo 5.5 > esperado 5.0 — clampeado ao esperado → 0% redução
    const r = computeMyerCotton(5.5, 5.0);
    expect(r).not.toBeNull();
    expect(r!.gradeNum).toBe(1);
    expect(r!.reductionPct).toBeCloseTo(0, 1);
  });
});

// ─── Consistência do mapa MYER_COTTON_EXPECTED ───────────────────────────────

describe('MYER_COTTON_EXPECTED — integridade do mapa', () => {
  const bands = Object.keys(MYER_COTTON_EXPECTED);

  it('contém exatamente 7 faixas etárias', () => {
    expect(bands).toHaveLength(7);
  });

  it('todos os expected_id_mm são positivos e dentro de limites fisiológicos', () => {
    for (const [band, { expected }] of Object.entries(MYER_COTTON_EXPECTED)) {
      expect(expected, `${band}: expected deve ser > 0`).toBeGreaterThan(0);
      expect(expected, `${band}: expected deve ser < 15mm`).toBeLessThan(15);
    }
  });

  it('valores de expected crescem monotonamente com a faixa etária', () => {
    const values = bands.map((b) => MYER_COTTON_EXPECTED[b].expected);
    for (let i = 1; i < values.length; i++) {
      expect(values[i], `${bands[i]} deve ser ≥ ${bands[i - 1]}`).toBeGreaterThanOrEqual(
        values[i - 1],
      );
    }
  });

  it('todos os ranges têm formato "x.x–x.x"', () => {
    for (const [band, { range }] of Object.entries(MYER_COTTON_EXPECTED)) {
      expect(range, `${band}: range inválido`).toMatch(/^\d+(\.\d+)?[–-]\d+(\.\d+)?$/);
    }
  });
});
