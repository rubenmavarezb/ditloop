import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useConfig, type ProfileConfig } from './useConfig.js';

/** Provide profile management from DitLoop config. */
export function useProfiles() {
  const { config, loading: configLoading } = useConfig();
  const [currentEmail, setCurrentEmail] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const refreshCurrent = useCallback(async () => {
    try {
      const email = await invoke<string | null>('get_git_identity');
      setCurrentEmail(email ?? undefined);
    } catch {
      setCurrentEmail(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCurrent();
  }, [refreshCurrent]);

  const profiles = config?.profiles ?? {};

  /** Find the profile name matching the current git email. */
  const currentProfileName = Object.entries(profiles).find(
    ([, p]: [string, ProfileConfig]) => p.email === currentEmail,
  )?.[0];

  return {
    profiles,
    currentEmail,
    currentProfileName,
    loading: loading || configLoading,
    refreshCurrent,
  };
}
