import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchProcedures } from '../services/api';
import type { Procedure } from '../types/content';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReferencesPanel } from '../components/ReferencesPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const OUTCOME_LABEL: Record<string, string> = {
  decannulation: 'Decanulacao',
  reintervention: 'Reintervencao',
  voice: 'Voz',
  swallow: 'Degluticao',
  complications: 'Complicacoes',
  followup: 'Follow-up',
};

export function ProceduresPage() {
  useDocumentTitle('Procedimentos');
  const [items, setItems] = useState<Procedure[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchProcedures()
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
      <h1 className="text-2xl font-bold mb-1">Procedimentos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Outcome sets obrigatórios — decanulacao, reintervencao, voz, degluticao, complicacoes,
        follow-up.
      </p>

      <div className="space-y-3">
        {items.map((p) => {
          const isOpen = expanded === p.slug;
          return (
            <div key={p.slug} className="card overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggle(p.slug)}
                aria-expanded={isOpen}
                aria-controls={`procedure-detail-${p.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h2 className="font-semibold text-base">{p.title_pt}</h2>
                      <ConfidenceBadge level={p.confidence} rationale={p.confidence_rationale} />
                    </div>
                    <p className="text-xs text-otto-muted italic mb-1.5">{p.title_en}</p>
                    <div 