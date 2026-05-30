import axios from 'axios';
import type {
  Calculator,
  Condition,
  Event,
  FrontierItem,
  Instrument,
  NetworkNode,
  NewsItem,
  Pathway,
  Procedure,
  SearchHit,
  SearchResult,
} from '../types/content';

let apiUrl = import.meta.env.VITE_API_URL?.trim();

// Se não houver apiUrl definida e estiver rodando em produção (fora de localhost),
// aplica o fallback automático para a API do Render no backend de produção.
if (!apiUrl) {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    apiUrl = 'https://otto-aerodig-api.onrender.com';
  } else {
    apiUrl = 'static'; // modo estático para desenvolvimento local sem backend
  }
}

/**
 * Modo estatico: quando VITE_API_URL nao esta definido (ou vazio), o frontend
 * busca diretamente os JSONs em /data/ — bundle Vite empacota a pasta public/.
 * Permite testar o hub no Vercel SEM um backend rodando.
 *
 * Modo API: quando VITE_API_URL aponta para um backend FastAPI (Render),
 * o frontend faz GET /api/... normalmente.
 */
const STATIC_MODE = !apiUrl || apiUrl === 'static';

const api = axios.create({
  baseURL: apiUrl === 'static' ? '' : (apiUrl || ''),
  timeout: 20000,
});

async function getStatic<T>(path: string): Promise<T> {
  // Garante prefixo /data/ e sem /api
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path} failed: ${r.status}`);
  return r.json();
}

export async function fetchConditions(domain?: string): Promise<Condition[]> {
  if (STATIC_MODE) {
    const items = await getStatic<Condition[]>('/data/conditions.json');
    return domain ? items.filter((c) => c.domain === domain) : items;
  }
  const { data } = await api.get<Condition[]>('/api/conditions', {
    params: domain ? { domain } : {},
  });
  return data;
}

export async function fetchCondition(slug: string): Promise<Condition> {
  if (STATIC_MODE) {
    return getStatic<Condition>(`/data/conditions/${slug}.json`);
  }
  const { data } = await api.get<Condition>(`/api/conditions/${slug}`);
  return data;
}

export async function fetchPathways(): Promise<Pathway[]> {
  if (STATIC_MODE) return getStatic<Pathway[]>('/data/pathways.json');
  const { data } = await api.get<Pathway[]>('/api/pathways');
  return data;
}

export async function fetchInstruments(): Promise<Instrument[]> {
  if (STATIC_MODE) return getStatic<Instrument[]>('/data/instruments.json');
  const { data } = await api.get<Instrument[]>('/api/instruments');
  return data;
}

export async function fetchProcedures(): Promise<Procedure[]> {
  if (STATIC_MODE) return getStatic<Procedure[]>('/data/procedures.json');
  const { data } = await api.get<Procedure[]>('/api/procedures');
  return data;
}

export async function fetchFrontier(): Promise<FrontierItem[]> {
  if (STATIC_MODE) return getStatic<FrontierItem[]>('/data/frontier.json');
  const { data } = await api.get<FrontierItem[]>('/api/frontier');
  return data;
}

export async function fetchNetwork(): Promise<NetworkNode[]> {
  if (STATIC_MODE) return getStatic<NetworkNode[]>('/data/network-nodes.json');
  const { data } = await api.get<NetworkNode[]>('/api/network');
  return data;
}

export async function fetchNews(status: string = 'published'): Promise<NewsItem[]> {
  if (STATIC_MODE) {
    const items = await getStatic<NewsItem[]>('/data/news.json');
    return items.filter((n) => n.status === status);
  }
  const { data } = await api.get<NewsItem[]>('/api/news', { params: { status } });
  return data;
}

export async function fetchEvents(): Promise<Event[]> {
  if (STATIC_MODE) {
    const items = await getStatic<Event[]>('/data/events.json');
    const today = new Date().toISOString().slice(0, 10);
    return items
      .filter((e) => (e.ends_on || e.starts_on) >= today)
      .sort((a, b) => a.starts_on.localeCompare(b.starts_on));
  }
  const { data } = await api.get<Event[]>('/api/events', { params: { upcoming: true } });
  return data;
}

export async function fetchCalculators(): Promise<Calculator[]> {
  if (STATIC_MODE) return getStatic<Calculator[]>('/data/calculators.json');
  const { data } = await api.get<Calculator[]>('/api/calculators');
  return data;
}

export async function fetchCalculator(slug: string): Promise<Calculator> {
  if (STATIC_MODE) {
    const items = await getStatic<Calculator[]>('/data/calculators.json');
    const found = items.find((c) => c.slug === slug);
    if (!found) throw new Error(`Calculator ${slug} not found`);
    return found;
  }
  const { data } = await api.get<Calculator>(`/api/calculators/${slug}`);
  return data;
}

function matches(text: string | undefined, q: string): boolean {
  return !!text && text.toLowerCase().includes(q.toLowerCase());
}

export async function search(q: string): Promise<SearchResult> {
  q = q.trim();
  if (!q) return { query: q, total: 0, hits: [] };

  if (STATIC_MODE) {
    const [conds, paths, insts, procs, fronts, nets, newss, evts] = await Promise.all([
      fetchConditions(),
      fetchPathways(),
      fetchInstruments(),
      fetchProcedures(),
      fetchFrontier(),
      fetchNetwork(),
      fetchNews('published').catch(() => [] as NewsItem[]),
      fetchEvents().catch(() => [] as Event[]),
    ]);

    const hits: SearchHit[] = [];

    for (const c of conds) {
      if (matches(c.title_pt, q) || matches(c.title_en, q) || matches(c.summary, q)) {
        hits.push({
          entity_type: 'condition',
          slug: c.slug,
          title_pt: c.title_pt,
          title_en: c.title_en,
          excerpt: c.summary.slice(0, 240),
          confidence: c.confidence,
        });
      }
    }
    for (const p of paths) {
      if (matches(p.title_pt, q) || matches(p.entry_symptom, q)) {
        hits.push({
          entity_type: 'pathway',
          slug: p.slug,
          title_pt: p.title_pt,
          title_en: p.title_en,
          excerpt: p.entry_symptom,
          confidence: p.confidence,
        });
      }
    }
    for (const i of insts) {
      if (matches(i.title_pt, q) || matches(i.title_en, q)) {
        hits.push({
          entity_type: 'instrument',
          slug: i.slug,
          title_pt: i.title_pt,
          title_en: i.title_en,
          excerpt: i.interpretation.slice(0, 240),
          confidence: i.confidence,
        });
      }
    }
    for (const pr of procs) {
      if (matches(pr.title_pt, q) || matches(pr.title_en, q)) {
        hits.push({
          entity_type: 'procedure',
          slug: pr.slug,
          title_pt: pr.title_pt,
          title_en: pr.title_en,
          excerpt: pr.technique_notes.slice(0, 240),
          confidence: pr.confidence,
        });
      }
    }
    for (const f of fronts) {
      if (matches(f.title_pt, q) || matches(f.summary, q)) {
        hits.push({
          entity_type: 'frontier',
          slug: f.slug,
          title_pt: f.title_pt,
          title_en: f.title_en,
          excerpt: f.summary.slice(0, 240),
          confidence: f.confidence,
        });
      }
    }
    for (const n of nets) {
      if (matches(n.title_pt, q) || matches(n.institution, q)) {
        hits.push({
          entity_type: 'network',
          slug: n.slug,
          title_pt: n.title_pt,
          title_en: n.title_en,
          excerpt: `${n.institution} - ${n.city}, ${n.country}`,
          confidence: n.confidence,
        });
      }
    }
    for (const nw of newss) {
      if (matches(nw.title_pt, q) || matches(nw.summary_ptbr, q)) {
        hits.push({
          entity_type: 'news',
          slug: nw.slug,
          title_pt: nw.title_pt,
          title_en: nw.title_en,
          excerpt: (nw.summary_ptbr || '').slice(0, 240),
          confidence: nw.confidence,
        });
      }
    }
    for (const ev of evts) {
      if (matches(ev.title_pt, q) || matches(ev.organizer, q)) {
        hits.push({
          entity_type: 'event',
          slug: ev.slug,
          title_pt: ev.title_pt,
          title_en: ev.title_en,
          excerpt: `${ev.organizer} - ${ev.location} - ${ev.starts_on}`,
          confidence: ev.confidence,
        });
      }
    }

    return { query: q, total: hits.length, hits: hits.slice(0, 30) };
  }

  const { data } = await api.get<SearchResult>('/api/search', { params: { q } });
  return data;
}

export const isStaticMode = STATIC_MODE;
export { api };
