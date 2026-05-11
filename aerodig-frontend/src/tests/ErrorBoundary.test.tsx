/**
 * Testes para o ErrorBoundary.
 *
 * Cobre:
 *  - Renderiza filhos normalmente quando não há erro
 *  - Quando filho lança erro, mostra a UI de fallback
 *  - Mensagem de erro do throw aparece no fallback
 *  - Existe botão para voltar ao início
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Suprime console.error para erros capturados pelo boundary (expected behavior)
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Componente auxiliar que lança erro ───────────────────────────────────────

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Erro simulado de teste');
  return <div>Conteúdo OK</div>;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  it('renderiza filhos normalmente quando não há erro', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Conteúdo OK')).toBeInTheDocument();
  });

  it('exibe UI de fallback quando filho lança erro', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    // Não deve mostrar o conteúdo normal
    expect(screen.queryByText('Conteúdo OK')).toBeNull();
    // Deve mostrar algum indicador de erro
    expect(
      screen.getByText(/erro|falha|inesperado/i),
    ).toBeInTheDocument();
  });

  it('exibe a mensagem do erro no fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Erro simulado de teste/i)).toBeInTheDocument();
  });

  it('exibe botão de ação para recuperação', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('múltiplos filhos — captura erro do filho problemático', () => {
    render(
      <ErrorBoundary>
        <div>Saudável</div>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.queryByText('Saudável')).toBeNull();
    expect(screen.getByText(/erro|falha|inesperado/i)).toBeInTheDocument();
  });
});
