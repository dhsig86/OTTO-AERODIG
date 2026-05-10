import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renderiza heading principal', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /Aerodigestive Hub/i })).toBeInTheDocument();
  });

  it('mostra os 8 tiles de camadas', () => {
    renderHome();
    expect(screen.getByText(/Atlas de condições/)).toBeInTheDocument();
    expect(screen.getByText(/Pathways de decisão/)).toBeInTheDocument();
    expect(screen.getByText(/Instrumentos/)).toBeInTheDocument();
    expect(screen.getByText(/Procedimentos/)).toBeInTheDocument();
    expect(screen.getByText(/Radar de fronteira/)).toBeInTheDocument();
    expect(screen.getByText(/Mapa de rede/)).toBeInTheDocument();
    expect(screen.getByText(/News/)).toBeInTheDocument();
    expect(screen.getByText(/Eventos/)).toBeInTheDocument();
  });

  it('mostra os princípios editoriais', () => {
    renderHome();
    expect(screen.getByText(/Princípios editoriais/)).toBeInTheDocument();
    expect(screen.getByText(/Ledger de confiança/)).toBeInTheDocument();
  });
});
