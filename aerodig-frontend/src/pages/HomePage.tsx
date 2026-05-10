import { Link } from 'react-router-dom';
import {
  BookOpen,
  GitBranch,
  Ruler,
  Scissors,
  Sparkles,
  Network,
  Newspaper,
  Calendar,
  Calculator,
} from 'lucide-react';
import { isStaticMode } from '../services/api';

const TILES = [
  { to: '/atlas', label: 'Atlas de condições', desc: 'Verbetes curados com classificações, red flags e exames-chave.', icon: BookOpen, color: 'text-otto-dark' },
  { to: '/pathways', label: 'Pathways de decisão', desc: 'Fluxos por sintoma, do estridor à aspiração crônica.', icon: GitBranch, color: 'text-aerodig-airway' },
  { to: '/instruments', label: 'Instrumentos', desc: 'Escalas validadas: Myer-Cotton, Benjamin-Inglis, PEDI-EAT-10, PSQ, EREFS…', icon: Ruler, color: 'text-otto-dark' },
  { to: '/calculators', label: 'Calculadoras', desc: 'Conversão de cânulas (Shiley, Bivona, Tracoe, Jackson…), PEDI-EAT-10, Myer-Cotton.', icon: Calculator, color: 'text-aerodig-airway' },
  { to: '/procedures', label: 'Procedimentos', desc: 'Outcome sets obrigatórios em toda página: decanulação, voz, deglutição.', icon: Scissors, color: 'text-aerodig-airway' },
  { to: '/frontier', label: 'Radar de fronteira', desc: 'IA, impressão 3D, genômica — separados do padrão de cuidado.', icon: Sparkles, color: 'text-aerodig-frontier' },
  { to: '/network', label: 'Mapa de rede', desc: 'Centros e especialistas no Brasil e no mundo.', icon: Network, color: 'text-otto-dark' },
  { to: '/news', label: 'News', desc: 'Pipeline diário PubMed + revistas-chave + resumo PT-BR.', icon: Newspaper, color: 'text-aerodig-news' },
  { to: '/events', label: 'Eventos', desc: 'Congressos, cursos e fellowships do campo aerodigestivo.', icon: Calendar, color: 'text-aerodig-event' },
];

export function HomePage() {
  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-xs uppercase tracking-wide text-otto-muted">OTTO Ecosystem</p>
          {isStaticMode && (
            <span
              className="pill bg-aerodig-news/15 text-amber-700"
              title="Frontend rodando com seeds estáticos. Backend FastAPI ainda não está conectado."
            >
              modo preview · v0.1
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-otto-dark mb-3">
          Aerodigestive Hub
        </h1>
        <p className="text-otto-text/80 max-w-2xl">
          Sistema operacional clínico-editorial brasileiro de medicina aerodigestiva pediátrica —
          laringe, traqueia, esôfago, deglutição e sono em uma única arquitetura. Cada verbete carrega
          ledger de confiança explícito.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="card flex flex-col gap-2 hover:border-otto-primary/40"
          >
            <t.icon size={22} className={t.color} />
            <h2 className="font-semibold">{t.label}</h2>
            <p className="text-sm text-otto-muted">{t.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10 card">
        <h3 className="font-semibold mb-2">Princípios editoriais</h3>
        <ul className="text-sm text-otto-text/80 space-y-1.5 list-disc pl-5">
          <li>Separar padrão de cuidado, variante de centro e experimental.</li>
          <li>Organizar por decisão, não apenas por anatomia.</li>
          <li>Outcome-sets obrigatórios em toda página de procedimento.</li>
          <li>Ledger de confiança em todo verbete (alta / moderada / baixa).</li>
          <li>Dados brasileiros sempre que existirem; sinalizar quando faltarem.</li>
        </ul>
      </section>
    </div>
  );
}
