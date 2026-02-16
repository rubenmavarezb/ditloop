import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useConnectionStore } from '@ditloop/web-ui';

/** Server info from Rust backend. */
interface ServerInfo {
  url: string;
  port: number;
  healthy: boolean;
}

/** Auto-detect a local DitLoop server and offer to connect. */
export function useAutoConnect() {
  const [detectedServer, setDetectedServer] = useState<ServerInfo | null>(null);
  const [scanning, setScanning] = useState(false);
  const configured = useConnectionStore((s) => s.configured);
  const configure = useConnectionStore((s) => s.configure);

  const scan = async () => {
    setScanning(true);
    try {
      const server = await invoke<ServerInfo | null>('detect_local_server');
      setDetectedServer(server ?? null);
      return server;
    } catch {
      setDetectedServer(null);
      return null;
    } finally {
      setScanning(false);
    }
  };

  // Auto-scan on mount if not already configured
  useEffect(() => {
    if (!configured) {
      scan();
    }
  }, [configured]);

  const connectToDetected = (token: string) => {
    if (detectedServer) {
      configure(detectedServer.url, token);
    }
  };

  return {
    detectedServer,
    scanning,
    scan,
    connectToDetected,
  };
}
