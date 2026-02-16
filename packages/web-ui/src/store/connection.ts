import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Connection status to the DitLoop server. */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** Connection store state and actions. */
export interface ConnectionState {
  /** Server base URL (e.g. http://localhost:4321). */
  serverUrl: string;
  /** Bearer token for authentication. */
  token: string;
  /** Current connection status. */
  status: ConnectionStatus;
  /** Last error message, if any. */
  error: string | null;
  /** Whether the connection has been configured at least once. */
  configured: boolean;

  /** Save server URL and token, mark as configured. */
  configure: (serverUrl: string, token: string) => void;
  /** Update connection status. */
  setStatus: (status: ConnectionStatus, error?: string) => void;
  /** Clear saved connection and reset to defaults. */
  disconnect: () => void;
}

/** Zustand store for server connection state, persisted to localStorage. */
export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      serverUrl: '',
      token: '',
      status: 'disconnected',
      error: null,
      configured: false,

      configure: (serverUrl, token) =>
        set({
          serverUrl: serverUrl.replace(/\/+$/, ''),
          token,
          configured: true,
          status: 'disconnected',
          error: null,
        }),

      setStatus: (status, error) =>
        set({ status, error: error ?? null }),

      disconnect: () =>
        set({
          serverUrl: '',
          token: '',
          status: 'disconnected',
          error: null,
          configured: false,
        }),
    }),
    {
      name: 'ditloop-connection',
      storage: {
        getItem: (name) => {
          // URL from localStorage (persists across sessions)
          const saved = localStorage.getItem(name);
          // Token from sessionStorage (cleared on tab close)
          const tokenData = sessionStorage.getItem(`${name}-token`);
          if (!saved) return null;
          const parsed = JSON.parse(saved);
          if (tokenData) {
            const tokenParsed = JSON.parse(tokenData);
            parsed.state.token = tokenParsed.token;
            parsed.state.configured = !!tokenParsed.token;
          } else {
            // No token in session — user must re-enter
            parsed.state.token = '';
            parsed.state.configured = false;
          }
          return parsed;
        },
        setItem: (name, value) => {
          const data = JSON.parse(JSON.stringify(value));
          // Store token separately in sessionStorage
          const token = data.state?.token ?? '';
          sessionStorage.setItem(`${name}-token`, JSON.stringify({ token }));
          // Strip token from localStorage
          if (data.state) {
            data.state.token = '';
          }
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(`${name}-token`);
        },
      },
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        token: state.token,
        configured: state.configured,
      }) as ConnectionState,
    },
  ),
);
