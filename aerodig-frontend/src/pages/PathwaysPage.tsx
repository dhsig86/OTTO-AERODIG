import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPathways } from '../services/api';
import type { Pathway } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { PathwayDiagram } from '../components/PathwayDiagram';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function PathwaysPage() {
  const [items, setItems] = useState<Pathway[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchPathways()
      .then((data) => {
        setItems(data);
        // Auto-expande se vier de cross-link com state.highlight
        const highlighted = (location.state as { highlight?: string } | null)?.highlight;
        if (highlighted) setExpanded(highlighted);
      })
      .catch(() => setItems([]));
  }, [location.state]);

  function toggle(slug: string) {
    setExpanded((prev) => (prev === slug ? null : slug));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pathways de decisão</h1>
      <p className="text-otto-muted text-sm mb-6">
        Fluxos transversais — entrada por sintoma, saída por intervenção. Clique em um pathway
        para abrir o diagrama de decisão clínica.
      </p>

      <div className="s