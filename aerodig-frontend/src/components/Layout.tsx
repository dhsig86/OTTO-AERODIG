import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
        <footer className="max-w-5xl mx-auto px-6 pb-8 pt-4 text-xs text-otto-muted">
          <p>
            Conteúdo educacional. Não substitui avaliação médica. Verbetes carregam ledger de
            confiança explícito; consulte fontes para decisão clínica.
          </p>
        </footer>
      </main>
    </div>
  );
}
