import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@ditloop/core';
import { isTauri } from '../lib/tauri.js';

/** Config load result from Rust. */
interface ConfigLoadResult {
  config: RustConfig;
  configPath: string;
  exists: boolean;
}

/**
 * Rust-side config shape (flat workspaces array with string type field).
 * This matches the serde output from config.rs, which differs slightly
 * from core's discriminated union.
 */
interface RustConfig {
  profiles: Record<string, Profile>;
  workspaces: RustWorkspace[];
}

/** Workspace entry as returned by Rust serde (flat, not discriminated union). */
export interface RustWorkspace {
  name: string;
  path: string;
  type: string;
  profile: string;
  aidf: boolean;
}

/** Load and manage DitLoop configuration from ~/.ditloop/config.yml. */
export function useConfig() {
  const [config, setConfig] = useState<RustConfig | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [configExists, setConfigExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isTauri()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
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
