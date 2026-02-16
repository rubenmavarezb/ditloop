import { useState, useEffect, useCallback } from 'react';
import type { StatusFileEntry } from '@ditloop/ui';

/** Data returned by the useGitStatusPanel hook. */
export interface GitStatusPanelData {
  /** Staged files. */
  staged: StatusFileEntry[];
  /** Unstaged modified files. */
  unstaged: StatusFileEntry[];
  /** Untracked file paths. */
  untracked: string[];
  /** Currently selected file index. */
  selectedIndex: number;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
  /** Total number of files. */
  totalFiles: number;
}

/**
 * Hook that manages git status panel state and connects to core GitStatusReader.
 * Provides selection navigation and live file status updates.
 *
 * @param repoPath - Path to the git repository
 * @returns Panel data with staged, unstaged, untracked files and selection controls
 */
export function useGitStatusPanel(repoPath: string | null): GitStatusPanelData {
  const [staged, setStaged] = useState<StatusFileEntry[]>([]);
  const [unstaged, setUnstaged] = useState<StatusFileEntry[]>([]);
  const [untracked, setUntracked] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalFiles = staged.length + unstaged.length + untracked.length;

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(totalFiles - 1, prev + 1));
  }, [totalFiles]);

  useEffect(() => {
    if (!repoPath) {
      setStaged([]);
      setUnstaged([]);
      setUntracked([]);
      setSelectedIndex(0);
      return;
    }

    // TODO: Wire to GitStatusReader.getStatus() and subscribe to git:status-changed events.
    // Reset selection when data changes.
    setSelectedIndex(0);
  }, [repoPath]);

  return { staged, unstaged, untracked, selectedIndex, moveUp, moveDown, totalFiles };
}
