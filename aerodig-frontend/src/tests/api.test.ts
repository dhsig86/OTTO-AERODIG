import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_API_URL', 'http://localhost:8003');

vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        get: vi.fn(),
      }),
    },
  };
});

import * as api from '../services/api';

describe('api client', () => {
  it('fetchConditions chama /api/conditions', async () => {
    const mockedGet = api.api.get as any;
    mockedGet.mockResolvedValueOnce({ data: [{ slug: 'laringomalacia' }] });
    const res = await api.fetchConditions();
    expect(mockedGet).toHaveBeenCalledWith('/api/conditions', { params: {} });
    expect(res[0].slug).toBe('laringomalacia');
  });

  it('fetchConditions com domain envia params', async () => {
    const mockedGet = api.api.get as any;
    mockedGet.mockResolvedValueOnce({ data: [] });
    await api.fetchConditions('larynx');
    expect(mockedGet).toHaveBeenCalledWith('/api/conditions', { params: { domain: 'larynx' } });
  });

  it('search envia q', async () => {
    const mockedGet = api.api.get as any;
    mockedGet.mockResolvedValueOnce({ data: { query: 'x', total: 0, hits: [] } });
    const r = await api.search('x');
    expect(r.total).toBe(0);
    expect(mockedGet).toHaveBeenCalledWith('/api/search', { params: { q: 'x' } });
  });
});
