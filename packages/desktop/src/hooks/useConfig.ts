import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

/** Profile from DitLoop config. */
export interface ProfileConfig {
  name: string;
  email: string;
  sshHost?: string;
  sshKey?: string;
  platform?: string;
}

/** Workspace entry from DitLoop config. */
export interface WorkspaceConfig {
  name: string;
  path: string;
  type: string;
  profile: string;
  aidf: boolean;
}

/** Full DitLoop config. */
export interface DitLoopConfig {
  profiles: Record<string, ProfileConfig>;
  workspaces: WorkspaceConfig[];
}

/** Config load result from Rust. */
interface ConfigLoadResult {
  config: DitLoopConfig;
  configPath: string;
  exists: boolean;
}

/** Load and manage DitLoop configuration from ~/.ditloop/config.yml. */
export function useConfig() {
  const [config, setConfig] = useState<DitLoopConfig | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [configExists, setConfigExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<ConfigLoadResult>('load_ditloop_config');
      setConfig(result.config);
      setConfigPath(result.configPath);
      setConfigExists(result.exists);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { config, configPath, configExists, loading, error, reload };
}
