/**
 * Testes para o hook useDocumentTitle.
 *
 * Cobre:
 *  - Seta document.title no formato "<page> | OTTO Aerodigestive Hub"
 *  - String vazia usa apenas o BASE_TITLE
 *  - Restaura o BASE_TITLE no unmount
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const BASE_TITLE = 'OTTO Aerodigestive Hub';

beforeEach(() => {
  document.title = BASE_TITLE;
});

describe('useDocumentTitle', () => {
  it('seta título no formato "Página | BASE_TITLE"', () => {
    renderHook(() => useDocumentTitle('Atlas'));
    expect(document.title).toBe(`Atlas | ${BASE_TITLE}`);
  });

  it('string vazia usa apenas BASE_TITLE', () => {
    renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe(BASE_TITLE);
  });

  it('título muda quando a prop muda (re-render)', () => {
    let page = 'Calculadoras';
    const { rerender } = renderHook(() => useDocumentTitle(page));
    expect(document.title).toBe(`Calculadoras | ${BASE_TITLE}`);

    page = 'Pathways de decisao';
    rerender();
    expect(document.title).toBe(`Pathways de decisao | ${BASE_TITLE}`);
  });

  it('restaura BASE_TITLE no unmount', () => {
    document.title = `Calculadoras | ${BASE_TITLE}`;
    const { unmount } = renderHook(() => useDocumentTitle('Calculadoras'));
    unmount();
    expect(document.title).toBe(BASE_TITLE);
  });

  it('múltiplas páginas distintas setam títulos corretos', () => {
    const pages = ['Atlas', 'Pathways de decisao', 'Instrumentos', 'Procedimentos'];
    for (const p of pages) {
      const { unmount } = renderHook(() => useDocumentTitle(p));
      expect(document.title).toBe(`${p} | ${BASE_TITLE}`);
      unmount();
    }
  });
});

// Garantia de cleanup entre testes
afterEach(cleanup);
