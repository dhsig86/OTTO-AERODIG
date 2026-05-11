import { useEffect } from 'react';

const BASE_TITLE = 'OTTO Aerodigestive Hub';

/**
 * Atualiza document.title para a pagina atual.
 * Usa o formato "Titulo da Pagina | OTTO Aerodigestive Hub".
 * Ao desmontar, restaura o titulo base.
 */
export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [pageTitle]);
}
