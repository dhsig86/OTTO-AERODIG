import type { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
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
            Conteúdo educacional. Não substitui avaliação médica. Verbetes