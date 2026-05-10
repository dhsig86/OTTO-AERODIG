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

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-otto-border bg-otto-surface px-3 py-6 hidden md:block">
      <div className="mb-6 px-2">
        <p className="text-otto-dark font-bold leading-tight">OTTO</p>
        <p className="text-xs text-otto-muted">Aerodigestive Hub</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-otto-light text-otto-dark font-medium'
                  : 'text-otto-text hover:bg-otto-bg',
              ].join(' ')
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
