import { useConnectionStore } from '../store/connection.js';

/** API error with status code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an authenticated request to the DitLoop server API.
 *
 * @param path - API path (e.g. "/workspaces")
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-ok responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { serverUrl, token } = useConnectionStore.getState();

  if (!serverUrl || !token) {
    throw new ApiError('Not connected to server', 0);
  }

  const url = `${serverUrl}/api${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(body.error ?? response.statusText, response.status);
  }

  return response.json() as Promise<T>;
}

/**
 * Check if the server is reachable and the token is valid.
 * Makes an unauthenticated health check AND an authenticated request.
 *
 * @returns True if server is reachable and token is accepted
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const { serverUrl, token } = useConnectionStore.getState();

    // Check server is reachable
    const healthRes = await fetch(`${serverUrl}/api/health`);
    if (!healthRes.ok) return false;

    // Validate token with an authenticated endpoint
    const authRes = await fetch(`${serverUrl}/api/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return authRes.ok;
  } catch {
    return false;
  }
}
