import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[OTTO AERODIG] Componente crashou:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-lg font-semibold text-otto-dark mb-2">
            Algo deu errado nesta página
          </h1>
          <p className="text-xs text-otto-muted mb-1 font-mono bg-otto-bg px-3 py-1 rounded max-w-md break-all">
            {this.state.message || 'Erro desconhecido'}
          </p>
          <p className="text-sm text-otto-muted mt-3 mb-6">
            O conteúdo educacional permanece disponível. Tente voltar ao início.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg bg-otto-dark text-white text-sm hover:bg-otto-primary transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
