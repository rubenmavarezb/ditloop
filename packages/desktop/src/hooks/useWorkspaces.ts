import { useMemo } from 'react';
import type { Profile, ResolvedWorkspace } from '@ditloop/core';
import { useConfig, type RustWorkspace } from './useConfig.js';

/** Desktop-specific resolved workspace with optional profile config. */
export interface DesktopWorkspace extends Omit<ResolvedWorkspace, 'projects' | 'config'> {
  profileConfig?: Profile;
}

/** Generate a URL-safe slug from a workspace name. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Provide resolved workspaces from DitLoop config. */
export function useWorkspaces() {
  const { config, configExists, loading, error, reload } = useConfig();

  const workspaces = useMemo<DesktopWorkspace[]>(() => {
    if (!config) return [];

    return config.workspaces.map((ws: RustWorkspace) => ({
      id: slugify(ws.name),
      name: ws.name,
      type: (ws.type === 'group' ? 'group' : 'single') as 'single' | 'group',
      path: ws.path,
      profile: ws.profile,
      profileConfig: config.profiles[ws.profile],
      aidf: ws.aidf,
    }));
  }, [config]);

  return { workspaces, configExists, loading, error, reload };
}
