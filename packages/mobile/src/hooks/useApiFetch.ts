import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, ApiError } from '../api/client.js';

/** State returned by the useApiFetch hook. */
interface ApiFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook that fetches data from the DitLoop server API with abort support.
 *
 * @param path - API path (e.g. "/workspaces")
 * @returns Object with data, loading, error, and refetch
 */
export function useApiFetch<T>(path: string): ApiFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof ApiError ? err.message : 'Unknown error';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [path]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
