import type { Confidence } from '../types/content';

interface Props {
  level: Confidence;
  rationale?: string;
}

const LABELS: Record<Confidence, string> = {
  high: 'Alta confiança',
  moderate: 'Confiança moderada',
  low: 'Baixa confiança',
};

const CLASSES: Record<Confidence, string> = {
  high: 'pill-high',
  moderate: 'pill-mod',
  low: 'pill-low',
};

export function ConfidenceBadge({ level, rationale }: Props) {
  return (
    <span
      className={CLASSES[level]}
      title={rationale}
      data-testid={`confidence-badge-${level}`}
    >
      {LABELS[level]}
    </span>
  );
}
