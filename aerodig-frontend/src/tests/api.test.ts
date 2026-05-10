import { describe, expect, it, vi } from 'vitest';

// Mock axios antes do import do api
vi.mock('axios', () => {
  const get = vi.fn();
  return {
    default: {
      create: () => ({ get }),
    },
    __get: get,
  };
});

import * as api from '../services/api';
import axios from 'axios';

const mockedGet = (axios as unknown as { __get: ReturnType<typeof vi.fn> }).__get;

describe('api client', () => {
  it('fetchConditions chama /api/conditions', async () => {
    mockedGet.mockResolvedValueOnce({ data: [{ slug: 'laringomalacia' }] });
    const res = await api.fetchConditions();
    expect(mockedGet).toHaveBeenCalledWith('/api/conditions', { params: {} });
    expect(res[0].slug).toBe('laringomalacia');
  });

  it('fetchConditions com domain envia params', async () => {
    mockedGet.mockResolvedValueOnce({ data: [] });
    await api.fetchConditions('larynx');
    expect(mockedGet).toHaveBeenCalledWith('/api/conditions', { params: { domain: 'larynx' } });
  });

  it('search envia q', async () => {
    mockedGet.mockResolvedValueOnce({ data: { query: 'x', total: 0, hits: [] } });
    const r = await api.search('x');
    expect(r.total).toBe(0);
    expect(mockedGet).toHaveBeenCalledWith('/api/search', { params: { q: 'x' } });
  });
});
