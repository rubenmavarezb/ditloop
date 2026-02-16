import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConnectionStore } from '../store/connection.js';
import { apiFetch, checkHealth, ApiError } from './client.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useConnectionStore.getState().disconnect();
  });

  it('adds Authorization header', async () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'test-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'ok' }),
    });

    await apiFetch('/workspaces');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4321/api/workspaces',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('throws ApiError on non-ok response', async () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'tok');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Invalid token' }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Invalid token' }),
    });

    try {
      await apiFetch('/workspaces');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
      expect((err as ApiError).message).toBe('Invalid token');
    }
  });

  it('throws when not connected (no URL/token)', async () => {
    await expect(apiFetch('/workspaces')).rejects.toThrow('Not connected to server');
  });
});

describe('checkHealth', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    useConnectionStore.setState({
      serverUrl: 'http://localhost:4321',
      token: 'tok',
      configured: true,
      status: 'disconnected',
      error: null,
    });
  });

  it('returns true when health and auth both pass', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }); // health
    mockFetch.mockResolvedValueOnce({ ok: true }); // auth
    const result = await checkHealth();
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost:4321/api/health');
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'http://localhost:4321/api/workspaces', expect.objectContaining({
      headers: { Authorization: 'Bearer tok' },
    }));
  });

  it('returns false when health passes but auth fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }); // health
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 }); // auth
    const result = await checkHealth();
    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await checkHealth();
    expect(result).toBe(false);
  });
});
