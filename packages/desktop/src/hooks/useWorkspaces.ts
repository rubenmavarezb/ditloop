import { useMemo } from 'react';
import { useConfig, type WorkspaceConfig, type ProfileConfig } from './useConfig.js';

/** Resolved workspace for display in the desktop app. */
export interface ResolvedWorkspace {
  id: string;
  name: string;
  type: 'single' | 'group';
  path: string;
  profile: string;
  profileConfig?: ProfileConfig;
  aidf: boolean;
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

  const workspaces = useMemo<ResolvedWorkspace[]>(() => {
    if (!config) return [];

    return config.workspaces.map((ws: WorkspaceConfig) => ({
      id: slugify(ws.name),
      name: ws.name,
      type: (ws.type === 'group' ? 'group' : 'single') as 'single' | 'group',
      path: ws.path.replace(/^~/, ''),
      profile: ws.profile,
      profileConfig: config.profiles[ws.profile],
      aidf: ws.aidf,
    }));
  }, [config]);

  return { workspaces, configExists, loading, error, reload };
}
