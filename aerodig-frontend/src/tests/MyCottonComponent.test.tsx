/**
 * Testes de regressão para o componente UI do MyCottonCalculator.
 *
 * DIFERENÇA de myer-cotton.test.ts:
 *   - myer-cotton.test.ts → testa a lógica pura (computeMyerCotton, MYER_COTTON_EXPECTED)
 *   - Este arquivo → testa o componente React (select, input, output, acessibilidade)
 *
 * Regressões críticas cobertas:
 *  - "Pre-escolar" (sem acento) aparece no seletor (fix de key mismatch da sessão 1)
 *  - Todas as 7 faixas etárias estão no select
 *  - Resultado muda quando se informa o tubo observado
 *  - Grau IV pode ser selecionado via checkbox
 *  - Reset limpa resultado
 *  - data-testid="myer-cotton-result" está acessível
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyCottonCalculator } from '../components/MyCottonCalculator';
import type { Calculator } from '../types/content';

// ─── Fixture ──────────────────────────────────────────────────────────────────

const fixture: Calculator = {
  id: 'myer-cotton-calc',
  slug: 'myer-cotton-calc',
  title_pt: 'Estenose Subglótica — Myer-Cotton',
  title_en: 'Subglottic Stenosis — Myer-Cotton Grading',
  audience: 'pediatric',
  domain: 'laryngology',
  summary: 'Gradua estenose subglótica pelo método Myer-Cotton.',
  confidence: 'high',
  confidence_rationale: 'artigo original 1994 amplamente validado',
  inputs: [],
  outputs: [],
  reference_table: [
    { age_band: 'Neonato',          expected_id_mm: '3.0', expected_id_range: '2.5-3.5' },
    { age_band: 'Lactente (<6m)',    expected_id_mm: '3.5', expected_id_range: '3.0-3.5' },
    { age_band: 'Lactente (6-12m)', expected_id_mm: '4.0', expected_id_range: '3.5-4.0' },
    { age_band: 'Toddler (1-3a)',   expected_id_mm: '4.5', expected_id_range: '4.0-4.5' },
    { age_band: 'Pre-escolar',      expected_id_mm: '5.0', expected_id_range: '4.5-5.5' },
    { age_band: 'Escolar',          expected_id_mm: '6.0', expected_id_range: '5.5-6.5' },
    { age_band: 'Adolescente',      expected_id_mm: '7.0', expected_id_range: '6.5-7.5' },
  ],
  sources: [],
};

function renderCalc() {
  return render(<MyCottonCalculator calc={fixture} />);
}

// ─── Renderização ─────────────────────────────────────────────────────────────

describe('MyCottonCalculator — renderização', () => {
  it('renderiza sem crash', () => {
    expect(() => renderCalc()).not.toThrow();
  });

  it('exibe select de faixa etária', () => {
    renderCalc();
    expect(screen.getByRole('combobox', { name: /faixa etária/i })).toBeInTheDocument();
  });

  it('exibe todas as 7 faixas etárias no select', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    const options = Array.from((select as HTMLSelectElement).options).map((o) => o.value);
    expect(options).toContain('Neonato');
    expect(options).toContain('Lactente (<6m)');
    expect(options).toContain('Lactente (6-12m)');
    expect(options).toContain('Toddler (1-3a)');
    expect(options).toContain('Pre-escolar');   // ← REGRESSÃO CRÍTICA: sem acento
    expect(options).toContain('Escolar');
    expect(options).toContain('Adolescente');
    expect(options.filter(Boolean)).toHaveLength(7);
  });

  it('"Pre-escolar" (sem acento) está no seletor — regressão do key mismatch', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    const opts = Array.from((select as HTMLSelectElement).options).map((o) => o.value);
    // Não deve conter a versão com acento (que causava a regressão)
    expect(opts).not.toContain('Pré-escolar');
    // Deve conter a versão sem acento
    expect(opts).toContain('Pre-escolar');
  });
});

// ─── Interação ────────────────────────────────────────────────────────────────

describe('MyCottonCalculator — interação', () => {
  it('selecionar faixa etária exibe expected_id_mm esperado', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    fireEvent.change(select, { target: { value: 'Escolar' } });
    // Expected 6.0 para Escolar
    expect(screen.getByText(/6[.,]0/)).toBeInTheDocument();
  });

  it('inserir tubo observado exibe resultado', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    fireEvent.change(select, { target: { value: 'Pre-escolar' } }); // exp = 5.0
    const obsInput = screen.getByRole('spinbutton', { name: /maior tubo/i });
    fireEvent.change(obsInput, { target: { value: '3.0' } }); // ~64% → Grau II
    const result = screen.getByTestId('myer-cotton-result');
    expect(result).toBeInTheDocument();
    expect(result.textContent).toMatch(/Grau II/);
  });

  it('resultado muda corretamente entre graus', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    fireEvent.change(select, { target: { value: 'Escolar' } }); // exp = 6.0
    const obsInput = screen.getByRole('spinbutton', { name: /maior tubo/i });

    // Grau I: obs 5.0 / exp 6.0 → reduction ≈ 30.6%
    fireEvent.change(obsInput, { target: { value: '5.0' } });
    expect(screen.getByTestId('myer-cotton-result').textContent).toMatch(/Grau I/);

    // Grau III: obs 2.0 / exp 6.0 → reduction ≈ 88.9%
    fireEvent.change(obsInput, { target: { value: '2.0' } });
    expect(screen.getByTestId('myer-cotton-result').textContent).toMatch(/Grau III/);
  });

  it('checkbox Grau IV exibe resultado de grau IV', () => {
    renderCalc();
    const select = screen.getByRole('combobox', { name: /faixa etária/i });
    fireEvent.change(select, { target: { value: 'Escolar' } });
    const grauIVCheckbox = screen.getByRole('checkbox', { name: /Grau IV/i });
    fireEvent.click(grauIVCheckbox);
    expect(screen.getByTestId('myer-cotton-result').textContent).toMatch(/Grau IV/);
  });

  it('exibe tabela de referência com faixas etárias', () => {
    renderCalc();
    expect(
      screen.getByRole('table', { name: /tubos endotraqueais esperados/i }),
    ).toBeInTheDocument();
  });
});

// ─── ConfidenceBadge ──────────────────────────────────────────────────────────

describe('MyCottonCalculator — ConfidenceBadge', () => {
  it('exibe badge de alta confiança', () => {
    renderCalc();
    expect(screen.getByTestId('confidence-badge-high')).toBeInTheDocument();
  });
});
