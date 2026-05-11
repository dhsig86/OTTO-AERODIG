import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { fetchInstruments } from '../services/api';
import type { Instrument } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TYPE_LABEL: Record<string, string> = {
  screening: 'Triagem',
  functional: 'Funcional',
  outcome: 'Desfecho',
  histologic: 'Histológico',
  endoscopic: 'Endoscópico',
};

export function InstrumentsPage() {
  useDocumentTitle('Instrumentos');
  const [items, setItems] = useState<Instrument[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchInstruments()
      .then((data) => {
        setItems(data);
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
      <h1 className="text-2xl font-bold mb-1">Instrumentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Escalas, scores e classificações — validacao pediátrica e PT-BR sinalizadas.
      </p>

      <div className="space-y-3">
        {items.map((i) => {
          const isOpen = expanded === i.slug;
          return (
            <div key={i.slug} className="card overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggle(i.slug)}
                aria-expanded={isOpen}
                aria-controls={`instrument-detail-${i.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="