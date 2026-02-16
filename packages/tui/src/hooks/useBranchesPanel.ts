import { useState, useEffect, useCallback } from 'react';
import type { PanelBranchEntry } from '@ditloop/ui';

/** Data returned by the useBranchesPanel hook. */
export interface BranchesPanelData {
  /** Local branches. */
  local: PanelBranchEntry[];
  /** Remote branches. */
  remote: PanelBranchEntry[];
  /** Currently selected branch index. */
  selectedIndex: number;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
  /** Total branches displayed. */
  totalBranches: number;
}

/**
 * Hook that manages branches panel state and connects to core GitBranchManager.
 * Provides selection navigation and live branch updates.
 *
 * @param repoPath - Path to the git repository
 * @returns Panel data with local/remote branches and selection controls
 */
export function useBranchesPanel(repoPath: string | null): BranchesPanelData {
  const [local, setLocal] = useState<PanelBranchEntry[]>([]);
  const [remote, setRemote] = useState<PanelBranchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalBranches = local.length + remote.length;

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(totalBranches - 1, prev + 1));
  }, [totalBranches]);

  useEffect(() => {
    if (!repoPath) {
      setLocal([]);
      setRemote([]);
      setSelectedIndex(0);
      return;
    }

    // TODO: Wire to GitBranchManager.listBranches() and subscribe to
    // git:branch-created, git:branch-switched, git:branch-deleted events.
    setSelectedIndex(0);
  }, [repoPath]);

  return { local, remote, selectedIndex, moveUp, moveDown, totalBranches };
}
