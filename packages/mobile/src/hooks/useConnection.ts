import { useEffect, useCallback, useRef } from 'react';
import { useConnectionStore } from '../store/connection.js';
import { checkHealth, ditloopWs } from '../api/index.js';

/**
 * Manage server connection lifecycle.
 * Validates server health, connects WebSocket, and handles reconnection.
 *
 * @returns Object with connect/disconnect actions and current status
 */
export function useConnection() {
  const { serverUrl, token, status, error, configured, configure, setStatus, disconnect } =
    useConnectionStore();
  const connectingRef = useRef(false);

  const connect = useCallback(
    async (url: string, tok: string) => {
      if (connectingRef.current) return;
      connectingRef.current = true;

      configure(url, tok);
      setStatus('connecting');

      const healthy = await checkHealth();
      if (!healthy) {
        setStatus('error', 'Server unreachable');
        connectingRef.current = false;
        return;
      }

      ditloopWs.connect(['*']);
      connectingRef.current = false;
    },
    [configure, setStatus],
  );

  const handleDisconnect = useCallback(() => {
    ditloopWs.disconnect();
    disconnect();
  }, [disconnect]);

  // Auto-reconnect on mount if previously configured
  useEffect(() => {
    if (configured && serverUrl && token && status === 'disconnected') {
      connect(serverUrl, token);
    }
  }, [configured, serverUrl, token, status, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ditloopWs.disconnect();
    };
  }, []);

  return {
    serverUrl,
    token,
    status,
    error,
    configured,
    connect,
    disconnect: handleDisconnect,
  };
}
