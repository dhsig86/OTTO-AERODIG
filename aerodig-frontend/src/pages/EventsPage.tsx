import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import type { Event } from '../types/content';

export function EventsPage() {
  const [items, setItems] = useState<Event[]>([]);
  useEffect(() => {
    fetchEvents().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Eventos</h1>
      <p className="text-otto-muted text-sm mb-6">
        Congressos, cursos e fellowships do campo aerodigestivo.
      </p>
      <ul className="space-y-3">
        {items.map((e) => (
          <li key={e.slug} className="card">
            <header className="flex items-start justify-between gap-3 mb-1">
              <h2 className="font-semibold">{e.title_pt}</h2>
              <span className="pill bg-aerodig-event/15 text-emerald-700">{e.event_type}</span>
            </header>
            <p className="text-sm text-otto-muted mb-1">
              {e.organizer} · {e.location}
            </p>
            <p className="text-sm text-aerodig-airway">
              {e.starts_on}
              {e.ends_on && ` → ${e.ends_on}`}
            </p>
            {e.notes_ptbr && <p className="text-sm mt-2">{e.notes_ptbr}</p>}
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-otto-dark hover:underline mt-2 inline-block"
            >
              Site oficial ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
