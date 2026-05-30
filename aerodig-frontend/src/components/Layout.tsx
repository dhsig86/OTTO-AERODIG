import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar, MobileHeader } from './Sidebar';

/**
 * Layout principal do OTTO Aerodigestive Hub.
 *
 * Modo embed (?embed=1):
 *   Quando a URL contém o parâmetro `embed=1`, a sidebar e o header
 *   são omitidos, renderizando apenas o conteúdo principal. Isso permite
 *   que o OTTO CALC-HUB (e outros módulos) incorporem calculadoras via
 *   <iframe src="https://otto-aerodig.vercel.app/calculators?embed=1&highlight=myer-cotton-calc">
 *   sem o chrome de navegação do hub.
 */
export function Layout({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const isEmbed = params.get('embed') === '1' || (typeof window !== 'undefined' && window.self !== window.top);

  if (isEmbed) {
    return (
      <main className="min-h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">{children}</div>
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Mobile: header fixo com hamburger */}
      <MobileHeader />
      {/* Desktop: sidebar lateral */}
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6">{children}</div>
        <footer className="max-w-5xl mx-auto px-4 md:px-6 pb-8 pt-4 text-xs text-otto-muted">
          <p>
            Conteúdo educacional. Não substitui avaliação médica. Verbetes carregam ledger de
            confiança explícito; consulte fontes para decisão clínica.
          </p>
        </footer>
      </main>
    </div>
  );
}
