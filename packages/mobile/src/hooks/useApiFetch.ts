import { useState, useEffect, useCallback } from 'react';
import { apiFetch, ApiError } from '../api/client.js';

/** State returned by the useApiFetch hook. */
interface ApiFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook that fetches data from the DitLoop server API and manages loading/error state.
 *
 * @param path - API path (e.g. "/workspaces")
 * @returns Object with data, loading, error, and refetch
 */
export function useApiFetch<T>(path: string): ApiFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      setData(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
