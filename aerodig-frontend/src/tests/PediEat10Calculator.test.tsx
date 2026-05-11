/**
 * Testes anti-regressão para o PediEat10Calculator.
 *
 * Cobre:
 *  - Renderização dos 10 itens do questionário
 *  - Scoring: null enquanto incompleto; soma correta quando completo
 *  - Classificação POSITIVA (>3) e NEGATIVA (≤3)
 *  - Botão Reset restaura estado inicial
 *  - aria-pressed reflete seleção
 *  - Componente recebe e exibe ConfidenceBadge (via prop calc)
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PediEat10Calculator } from '../components/PediEat10Calculator';
import type { Calculator } from '../types/content';

// ─── Fixture ──────────────────────────────────────────────────────────────────

const fixture: Calculator = {
  id: 'pedi-eat-10-calc',
  slug: 'pedi-eat-10-calc',
  title_pt: 'Pedi-EAT-10',
  title_en: 'Pediatric EAT-10',
  audience: 'pediatric',
  domain: 'dysphagia',
  summary: 'Triagem de disfagia pediátrica',
  confidence: 'moderate',
  confidence_rationale: 'validação PT-BR disponível',
  inputs: Array(10).fill({ key: 'q', label: 'Item', input_type: 'number' }),
  outputs: [{ key: 'score', label: 'Escore total' }],
  sources: [],
};

function renderCalc() {
  return render(<PediEat10Calculator calc={fixture} />);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Marca todos os 10 itens com o valor `v` (0-4) */
function scoreAll(value: number) {
  // Cada item tem 5 botões (0-4); o índice `value` seleciona o botão correto
  const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
  // Agrupa em blocos de 5 (uma linha por item)
  for (let item = 0; item < 10; item++) {
    fireEvent.click(allButtons[item * 5 + value]);
  }
}

// ─── Testes de renderização ───────────────────────────────────────────────────

describe('PediEat10Calculator — renderização', () => {
  it('renderiza sem crash', () => {
    expect(() => renderCalc()).not.toThrow();
  });

  it('não mostra resultado antes de completar todos os itens', () => {
    renderCalc();
    expect(screen.queryByText(/POSITIVA/i)).toBeNull();
    expect(screen.queryByText(/NEGATIVA/i)).toBeNull();
  });

  it('mostra progresso "0 / 10"', () => {
    renderCalc();
    expect(screen.getByText(/0\s*\/\s*10/)).toBeInTheDocument();
  });

  it('exibe ConfidenceBadge com o nível do fixture', () => {
    renderCalc();
    expect(screen.getByTestId('confidence-badge-moderate')).toBeInTheDocument();
  });

  it('exibe o título do questionário', () => {
    renderCalc();
    expect(screen.getByText(/Pedi-EAT-10/i)).toBeInTheDocument();
  });
});

// ─── Testes de scoring ────────────────────────────────────────────────────────

describe('PediEat10Calculator — scoring', () => {
  it('score 0 (todos = 0) → NEGATIVA', () => {
    renderCalc();
    scoreAll(0);
    expect(screen.getByText(/NEGATIVA/i)).toBeInTheDocument();
    expect(screen.queryByText(/POSITIVA/i)).toBeNull();
  });

  it('score 40 (todos = 4) → POSITIVA', () => {
    renderCalc();
    scoreAll(4);
    expect(screen.getByText(/POSITIVA/i)).toBeInTheDocument();
    expect(screen.queryByText(/NEGATIVA/i)).toBeNull();
  });

  it('score 10 (todos = 1) → POSITIVA (10 > 3)', () => {
    renderCalc();
    scoreAll(1);
    expect(screen.getByText(/POSITIVA/i)).toBeInTheDocument();
  });

  it('score 3 (todos = 0 exceto 3 itens = 1) → NEGATIVA (3 ≤ 3)', () => {
    renderCalc();
    // Zera tudo (0) primeiro
    scoreAll(0);
    // Pontuação total = 0 → negativa. Agora marca 3 itens como 1 (total = 3)
    const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
    fireEvent.click(allButtons[0 * 5 + 1]); // item 0 → 1
    fireEvent.click(allButtons[1 * 5 + 1]); // item 1 → 1
    fireEvent.click(allButtons[2 * 5 + 1]); // item 2 → 1
    // restante são 0 → total = 3
    expect(screen.getByText(/NEGATIVA/i)).toBeInTheDocument();
  });

  it('score 4 (3 itens = 1 + 1 item = 1) → POSITIVA (4 > 3)', () => {
    renderCalc();
    scoreAll(0);
    const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
    for (let i = 0; i < 4; i++) fireEvent.click(allButtons[i * 5 + 1]);
    expect(screen.getByText(/POSITIVA/i)).toBeInTheDocument();
  });

  it('preencher só 9 dos 10 → sem resultado ainda', () => {
    renderCalc();
    const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
    // Marca apenas os 9 primeiros itens
    for (let i = 0; i < 9; i++) fireEvent.click(allButtons[i * 5 + 0]);
    expect(screen.queryByText(/POSITIVA/i)).toBeNull();
    expect(screen.queryByText(/NEGATIVA/i)).toBeNull();
    expect(screen.getByText(/9\s*\/\s*10/)).toBeInTheDocument();
  });
});

// ─── Reset ───────────────────────────────────────────────────────────────────

describe('PediEat10Calculator — reset', () => {
  it('botão Reset limpa os scores e remove resultado', () => {
    renderCalc();
    scoreAll(4); // POSITIVA
    expect(screen.getByText(/POSITIVA/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset|limpar|novo/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/POSITIVA/i)).toBeNull();
    expect(screen.queryByText(/NEGATIVA/i)).toBeNull();
    expect(screen.getByText(/0\s*\/\s*10/)).toBeInTheDocument();
  });
});

// ─── aria-pressed ─────────────────────────────────────────────────────────────

describe('PediEat10Calculator — acessibilidade', () => {
  it('botão selecionado tem aria-pressed="true"', () => {
    renderCalc();
    const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
    const firstItemZeroBtn = allButtons[0]; // item 0, valor 0
    expect(firstItemZeroBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(firstItemZeroBtn);
    expect(firstItemZeroBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('selecionar outro valor no mesmo item desmarca o anterior', () => {
    renderCalc();
    const allButtons = screen.getAllByRole('button', { name: /^\d+ — /i });
    fireEvent.click(allButtons[0]); // item 0 = 0
    fireEvent.click(allButtons[1]); // item 0 = 1 (muda!)
    expect(allButtons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(allButtons[1]).toHaveAttribute('aria-pressed', 'true');
  });
});
