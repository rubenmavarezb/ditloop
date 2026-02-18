import { useState, useEffect, useCallback } from 'react';
import { safeInvoke } from '../lib/tauri.js';

/** Identity mismatch result. */
export interface IdentityMismatch {
  currentEmail: string;
  expectedEmail: string;
  expectedProfile: string;
  workspaceId: string;
  workspaceName: string;
}

/**
 * Hook to detect git identity mismatches between current git config
 * and the expected profile for a workspace.
 */
export function useIdentityCheck(
  workspaceId: string | null,
  workspacePath: string | undefined,
  expectedProfile: string | undefined,
) {
  const [mismatch, setMismatch] = useState<IdentityMismatch | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    if (!workspaceId || !workspacePath || !expectedProfile) {
      setMismatch(null);
      return;
    }

    try {
      // Get current git identity
      const currentEmail = await safeInvoke<string | null>('get_git_identity');
      if (!currentEmail) {
        setMismatch(null);
        return;
      }

      // Load config to get expected email
      const config = await safeInvoke<{
        config: {
          profiles: Record<string, { name: string; email: string }>;
          workspaces: Array<{ name: string; profile: string }>;
        };
      }>('load_ditloop_config');

      const profile = config?.config.profiles[expectedProfile];
      if (!profile) {
        setMismatch(null);
        return;
      }

      if (currentEmail.toLowerCase() !== profile.email.toLowerCase()) {
        setMismatch({
          currentEmail,
          expectedEmail: profile.email,
          expectedProfile,
          workspaceId,
          workspaceName: '',
        });
        setDismissed(false);
      } else {
        setMismatch(null);
      }
    } catch {
      setMismatch(null);
    }
  }, [workspaceId, workspacePath, expectedProfile]);

  useEffect(() => {
    check();
  }, [check]);

  const switchProfile = useCallback(async () => {
    if (!mismatch) return;
    try {
      await safeInvoke('switch_git_profile', { profileName: mismatch.expectedProfile });
      setMismatch(null);
    } catch (e) {
      console.error('Failed to switch profile:', e);
    }
  }, [mismatch]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    mismatch: dismissed ? null : mismatch,
    switchProfile,
    dismiss,
    refresh: check,
  };
}
