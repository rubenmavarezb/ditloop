import { useState, useEffect } from 'react';
import type { WorkspaceItemData } from '@ditloop/ui';

/** Git status data for the workspace detail view. */
export interface WorkspaceGitStatus {
  branch: string;
  modified: number;
  staged: number;
  untracked: number;
}

/** Data returned by the useWorkspaceDetail hook. */
export interface WorkspaceDetailData {
  gitStatus: WorkspaceGitStatus | null;
  identityMatch: boolean | null;
  tasks: Array<{ id: string; title: string; status: string }>;
}

/**
 * Hook that wires WorkspaceDetail props from core services.
 * Subscribes to git:status-changed and identity events for live updates.
 *
 * @param workspace - The workspace to load detail data for
 * @returns Detail data for the WorkspaceDetail component
 */
export function useWorkspaceDetail(workspace: WorkspaceItemData | null): WorkspaceDetailData {
  const [gitStatus, setGitStatus] = useState<WorkspaceGitStatus | null>(null);
  const [identityMatch, setIdentityMatch] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);

  useEffect(() => {
    if (!workspace) {
      setGitStatus(null);
      setIdentityMatch(null);
      setTasks([]);
      return;
    }

    // TODO: Subscribe to eventBus for git:status-changed, git:branch-created,
    // git:branch-switched, profile:mismatch events when core services are
    // wired into the TUI app lifecycle.
    // For now, return static placeholder data.
    setGitStatus(null);
    setIdentityMatch(null);
    setTasks([]);
  }, [workspace]);

  return { gitStatus, identityMatch, tasks };
}
