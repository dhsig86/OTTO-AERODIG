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
 *
 * Adicionado fallback resiliente: se a API falhar ou demorar mais de 6 segundos,
 * o STATIC_MODE é ativado dinamicamente e permanentemente para a sessão.
 */
let STATIC_MODE = !apiUrl || apiUrl === 'static';

const api = axios.create({
  baseURL: apiUrl === 'static' ? '' : (apiUrl || ''),
  timeout: 20000,
});

async function getStatic<T>(path: string): Promise<T> {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path} failed: ${r.status}`);
  return r.json();
}

/**
 * Helper genérico para executar chamadas de rede com timeout cirúrgico de 6 segundos
 * e fallback automático para o modo estático se houver falha.
 */
async function requestWithFallback<T>(
  apiCall: () => Promise<{ data: T }>,
  staticPath: string,
  staticFilter?: (data: T) => T
): Promise<T> {
  if (STATIC_MODE) {
    const items = await getStatic<T>(staticPath);
    return staticFilter ? staticFilter(items) : items;
  }

  try {
    const responsePromise = apiCall();
    
    // Promessa de timeout de 6 segundos para cold starts no Render
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API Timeout (Cold Start)')), 6000)
    );

    const result = await Promise.race([responsePromise, timeoutPromise]);
    return result.data;
  } catch (err) {
    console.warn(`[API Fallback] Falha no backend (${err instanceof Error ? err.message : 'Erro'}). Ativando STATIC_MODE...`);
    STATIC_MODE = true; // Força STATIC_MODE para chamadas subsequentes
    const items = await getStatic<T>(staticPath);
    return staticFilter ? staticFilter(items) : items;
  }
}

export async function fetchConditions(domain?: string): Promise<Condition[]> {
  return requestWithFallback<Condition[]>(
    () => api.get<Condition[]>('/api/conditions', { params: domain ? { domain } : {} }),
    '/data/conditions.json',
    (items) => domain ? items.filter((c) => c.domain === domain) : items
  );
}

export async function fetchCondition(slug: string): Promise<Condition> {
  if (STATIC_MODE) {
    return getStatic<Condition>(`/data/conditions/${slug}.json`);
  }
  try {
    const responsePromise = api.get<Condition>(`/api/conditions/${slug}`);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 6000)
    );
    const result = await Promise.race([responsePromise, timeoutPromise]);
    return result.data;
  } catch (err) {
    console.warn(`[API Fallback] Erro na busca da condição ${slug}. Caindo para modo estático local.`);
    STATIC_MODE = true;
    return getStatic<Condition>(`/data/conditions/${slug}.json`);
  }
}

export async function fetchPathways(): Promise<Pathway[]> {
  return requestWithFallback<Pathway[]>(
    () => api.get<Pathway[]>('/api/pathways'),
    '/data/pathways.json'
  );
}

export async function fetchInstruments(): Promise<Instrument[]> {
  return requestWithFallback<Instrument[]>(
    () => api.get<Instrument[]>('/api/instruments'),
    '/data/instruments.json'
  );
}

export async function fetchProcedures(): Promise<Procedure[]> {
  return requestWithFallback<Procedure[]>(
    () => api.get<Procedure[]>('/api/procedures'),
    '/data/procedures.json'
  );
}

export async function fetchFrontier(): Promise<FrontierItem[]> {
  return requestWithFallback<FrontierItem[]>(
    () => api.get<FrontierItem[]>('/api/frontier'),
    '/data/frontier.json'
  );
}

export async function fetchNetwork(): Promise<NetworkNode[]> {
  return requestWithFallback<NetworkNode[]>(
    () => api.get<NetworkNode[]>('/api/network'),
    '/data/network-nodes.json'
  );
}

export async function fetchNews(status: string = 'published'): Promise<NewsItem[]> {
  return requestWithFallback<NewsItem[]>(
    () => api.get<NewsItem[]>('/api/news', { params: { status } }),
    '/data/news.json',
    (items) => items.filter((n) => n.status === status)
  );
}

export async function fetchEvents(): Promise<Event[]> {
  return requestWithFallback<Event[]>(
    () => api.get<Event[]>('/api/events', { params: { upcoming: true } }),
    '/data/events.json',
    (items) => {
      const today = new Date().toISOString().slice(0, 10);
      return items
        .filter((e) => (e.ends_on || e.starts_on) >= today)
        .sort((a, b) => a.starts_on.localeCompare(b.starts_on));
    }
  );
}

export async function fetchCalculators(): Promise<Calculator[]> {
  return requestWithFallback<Calculator[]>(
    () => api.get<Calculator[]>('/api/calculators'),
    '/data/calculators.json'
  );
}

export async function fetchCalculator(slug: string): Promise<Calculator> {
  if (STATIC_MODE) {
    const items = await getStatic<Calculator[]>('/data/calculators.json');
    const found = items.find((c) => c.slug === slug);
    if (!found) throw new Error(`Calculator ${slug} not found`);
    return found;
  }
  try {
    const responsePromise = api.get<Calculator>(`/api/calculators/${slug}`);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 6000)
    );
    const result = await Promise.race([responsePromise, timeoutPromise]);
    return result.data;
  } catch (err) {
    console.warn(`[API Fallback] Erro na busca da calculadora ${slug}. Caindo para modo estático local.`);
    STATIC_MODE = true;
    const items = await getStatic<Calculator[]>('/data/calculators.json');
    const found = items.find((c) => c.slug === slug);
    if (!found) throw new Error(`Calculator ${slug} not found`);
    return found;
  }
}

function matches(text: string | undefined, q: string): boolean {
  return !!text && text.toLowerCase().includes(q.toLowerCase());
}

async function runStaticSearch(q: string): Promise<SearchResult> {
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

export async function search(q: string): Promise<SearchResult> {
  q = q.trim();
  if (!q) return { query: q, total: 0, hits: [] };

  if (STATIC_MODE) {
    return runStaticSearch(q);
  }

  try {
    const responsePromise = api.get<SearchResult>('/api/search', { params: { q } });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 6000)
    );
    const result = await Promise.race([responsePromise, timeoutPromise]);
    return result.data;
  } catch (err) {
    console.warn(`[API Fallback] Erro na busca para query "${q}". Caindo para modo estático local.`);
    STATIC_MODE = true;
    return runStaticSearch(q);
  }
}

export { STATIC_MODE as isStaticMode };
export { api };
