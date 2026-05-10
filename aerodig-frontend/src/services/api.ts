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
  SearchResult,
} from '../types/content';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

export const api = axios.create({ baseURL, timeout: 20000 });

export async function fetchConditions(domain?: string): Promise<Condition[]> {
  const { data } = await api.get<Condition[]>('/api/conditions', {
    params: domain ? { domain } : {},
  });
  return data;
}

export async function fetchCondition(slug: string): Promise<Condition> {
  const { data } = await api.get<Condition>(`/api/conditions/${slug}`);
  return data;
}

export async function fetchPathways(): Promise<Pathway[]> {
  const { data } = await api.get<Pathway[]>('/api/pathways');
  return data;
}

export async function fetchInstruments(): Promise<Instrument[]> {
  const { data } = await api.get<Instrument[]>('/api/instruments');
  return data;
}

export async function fetchProcedures(): Promise<Procedure[]> {
  const { data } = await api.get<Procedure[]>('/api/procedures');
  return data;
}

export async function fetchFrontier(): Promise<FrontierItem[]> {
  const { data } = await api.get<FrontierItem[]>('/api/frontier');
  return data;
}

export async function fetchNetwork(): Promise<NetworkNode[]> {
  const { data } = await api.get<NetworkNode[]>('/api/network');
  return data;
}

export async function fetchNews(status: string = 'published'): Promise<NewsItem[]> {
  const { data } = await api.get<NewsItem[]>('/api/news', { params: { status } });
  return data;
}

export async function fetchEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>('/api/events', { params: { upcoming: true } });
  return data;
}

export async function fetchCalculators(): Promise<Calculator[]> {
  const { data } = await api.get<Calculator[]>('/api/calculators');
  return data;
}

export async function fetchCalculator(slug: string): Promise<Calculator> {
  const { data } = await api.get<Calculator>(`/api/calculators/${slug}`);
  return data;
}

export async function search(q: string): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>('/api/search', { params: { q } });
  return data;
}
