import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('renderiza badge alta com label correto', () => {
    render(<ConfidenceBadge level="high" rationale="consenso internacional" />);
    expect(screen.getByTestId('confidence-badge-high')).toHaveTextContent(/Alta confiança/);
  });

  it('renderiza badge moderada', () => {
    render(<ConfidenceBadge level="moderate" />);
    expect(screen.getByTestId('confidence-badge-moderate')).toHaveTextContent(
      /Confiança moderada/
    );
  });

  it('renderiza badge baixa', () => {
    render(<ConfidenceBadge level="low" />);
    expect(screen.getByTestId('confidence-badge-low')).toHaveTextContent(/Baixa confiança/);
  });

  it('expõe rationale via title', () => {
    render(<ConfidenceBadge level="low" rationale="nomenclatura emergente" />);
    const badge = screen.getByTestId('confidence-badge-low');
    expect(badge).toHaveAttribute('title', 'nomenclatura emergente');
  });
});
