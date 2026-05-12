import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  GitBranch,
  Ruler,
  Scissors,
  Sparkles,
  Network,
  Newspaper,
  Calendar,
  Search,
  Calculator,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/atlas', label: 'Atlas', icon: BookOpen },
  { to: '/pathways', label: 'Pathways', icon: GitBranch },
  { to: '/instruments', label: 'Instrumentos', icon: Ruler },
  { to: '/calculators', label: 'Calculadoras', icon: Calculator },
  { to: '/procedures', label: 'Procedimentos', icon: Scissors },
  { to: '/frontier', label: 'Fronteira', icon: Sparkles },
  { to: '/network', label: 'Rede', icon: Network },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/events', label: 'Eventos', icon: Calendar },
  { to: '/search', label: 'Buscar', icon: Search },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
    isActive ? 'bg-otto-light text-otto-dark font-medium' : 'text-otto-text hover:bg-otto-bg',
  ].join(' ');

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={navLinkClass}>
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Sidebar lateral — visivel apenas em desktop (>= md) */
export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-otto-border bg-otto-surface px-3 py-6 hidden md:block">
      <div className="mb-6 px-2">
        <p className="text-otto-dark font-bold leading-tight">OTTO</p>
        <p className="text-xs text-otto-muted">Aerodigestive Hub</p>
      </div>
      <NavLinks />
    </aside>
  );
}

/** Header com hamburger — visivel apenas em mobile (< md) */
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-otto-border bg-otto-surface sticky top-0 z-30">
        <div>
          <p className="text-otto-dark font-bold text-sm leading-tight">OTTO</p>
          <p className="text-[10px] text-otto-muted leading-none">Aerodigestive Hub</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          className="p-2 rounded-lg text-otto-muted hover:bg-otto-bg"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Overlay + Drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={close}
            aria-hidden="true"
          />
          <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-otto-surface border-r border-otto-border z-50 px-3 py-6 overflow-y-auto animate-fade-in">
            <div className="mb-6 px-2 flex items-center justify-between">
              <div>
                <p className="text-otto-dark font-bold leading-tight">OTTO</p>
                <p className="text-xs text-otto-muted">Aerodigestive Hub</p>
              </div>
              <button onClick={close} aria-label="Fechar menu" className="p-1 text-otto-muted">
                <X size={18} />
              </button>
            </div>
            <NavLinks onNavigate={close} />
          </div>
        </>
      )}
    </>
  );
}
