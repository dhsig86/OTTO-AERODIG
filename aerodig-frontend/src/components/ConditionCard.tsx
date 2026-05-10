import { Link } from 'react-router-dom';
import type { Condition } from '../types/content';
import { ConfidenceBadge } from './ConfidenceBadge';

export function ConditionCard({ c }: { c: Condition }) {
  return (
    <Link to={`/atlas/${c.slug}`} className="card block">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg leading-tight">{c.title_pt}</h3>
        <ConfidenceBadge level={c.confidence} rationale={c.confidence_rationale} />
      </div>
      <p className="text-xs text-otto-muted italic mb-2">{c.title_en}</p>
      <p className="text-sm text-otto-text/80 line-clamp-3">{c.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-otto-light text-otto-dark">
          {c.domain}
        </span>
        {c.age_range.slice(0, 3).map((a) => (
          <span
            key={a}
            className="text-xs px-2 py-0.5 rounded-full bg-aerodig-soft text-aerodig-airway"
          >
            {a}
          </span>
        ))}
      </div>
    </Link>
  );
}
