import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

/** AI tool info from Rust backend. */
interface AiToolInfo {
  name: string;
  command: string;
  version: string | null;
  available: boolean;
}

/** Hook to list detected AI CLI tools. */
export function useAiTools() {
  const [tools, setTools] = useState<AiToolInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    invoke<AiToolInfo[]>('detect_ai_tools')
      .then(setTools)
      .finally(() => setLoading(false));
  }, []);

  return { tools, loading };
}

/** Launch an AI CLI tool in a new terminal window. */
export function useLaunchAiCli() {
  const [launching, setLaunching] = useState(false);

  const launch = useCallback(
    async (tool: string, workspacePath: string, args: string[] = []) => {
      setLaunching(true);
      try {
        const pid = await invoke<number>('launch_ai_cli', {
          tool,
          workspacePath,
          args,
        });
        return pid;
      } finally {
        setLaunching(false);
      }
    },
    [],
  );

  return { launch, launching };
}
