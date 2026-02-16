import { useState, useEffect, useCallback, useRef } from 'react';
import { GitStatusReader } from '@ditloop/core';
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
  const readerRef = useRef<GitStatusReader | null>(null);

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

    let reader: GitStatusReader;
    try {
      reader = new GitStatusReader({ repoPath, workspace: repoPath });
    } catch {
      // Directory may not exist or not be a git repo
      return;
    }
    readerRef.current = reader;

    const loadStatus = async () => {
      try {
        const status = await reader.getStatus();
        setStaged(status.staged.map((f) => ({ path: f.path, status: f.index !== ' ' ? f.index : 'M' })));
        setUnstaged(status.unstaged.map((f) => ({ path: f.path, status: f.working_dir })));
        setUntracked(status.untracked);
        setSelectedIndex(0);
      } catch {
        setStaged([]);
        setUnstaged([]);
        setUntracked([]);
      }
    };

    loadStatus();
    reader.startPolling();

    return () => {
      reader.stopPolling();
      readerRef.current = null;
    };
  }, [repoPath]);

  return { staged, unstaged, untracked, selectedIndex, moveUp, moveDown, totalFiles };
}
