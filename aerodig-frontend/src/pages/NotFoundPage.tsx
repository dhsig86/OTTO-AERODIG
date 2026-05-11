import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Pagina nao encontrada');
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <p className="text-6xl font-bold text-otto-border mb-4">404</p>
      <h1 className="text-xl font-semibold text-otto-dark mb-2">Página não encontrada</h1>
      <p className="text-sm text-otto-muted mb-6 max-w-sm">
        A rota que você tentou acessar não existe neste hub.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-otto-dark text-white text-sm hover:bg-otto-primary transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
