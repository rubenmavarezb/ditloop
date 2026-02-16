import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiFetch } from './useApiFetch.js';
import { ApiError } from '../api/client.js';

// Mock the api client
vi.mock('../api/client.js', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

import { apiFetch } from '../api/client.js';
const mockApiFetch = vi.mocked(apiFetch);

describe('useApiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading=true initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useApiFetch('/test'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets data after successful fetch', async () => {
    mockApiFetch.mockResolvedValueOnce({ items: [1, 2, 3] });
    const { result } = renderHook(() => useApiFetch('/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ items: [1, 2, 3] });
    expect(result.current.error).toBeNull();
  });

  it('sets error on ApiError', async () => {
    mockApiFetch.mockRejectedValueOnce(new ApiError('Not found', 404));
    const { result } = renderHook(() => useApiFetch('/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Not found');
    expect(result.current.data).toBeNull();
  });

  it('refetch() re-fetches data', async () => {
    mockApiFetch.mockResolvedValueOnce({ v: 1 });
    const { result } = renderHook(() => useApiFetch('/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ v: 1 });

    mockApiFetch.mockResolvedValueOnce({ v: 2 });
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ v: 2 });
    });
  });
});
