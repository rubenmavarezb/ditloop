import { useState, useEffect, useCallback } from 'react';
import type { PanelCommitEntry } from '@ditloop/ui';

/** Data returned by the useCommitsPanel hook. */
export interface CommitsPanelData {
  /** Recent commits, newest first. */
  commits: PanelCommitEntry[];
  /** Currently selected commit index. */
  selectedIndex: number;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
}

/**
 * Hook that manages commits panel state and connects to core GitLogReader.
 * Provides selection navigation and live commit log updates.
 *
 * @param repoPath - Path to the git repository
 * @returns Panel data with commits and selection controls
 */
export function useCommitsPanel(repoPath: string | null): CommitsPanelData {
  const [commits, setCommits] = useState<PanelCommitEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(commits.length - 1, prev + 1));
  }, [commits.length]);

  useEffect(() => {
    if (!repoPath) {
      setCommits([]);
      setSelectedIndex(0);
      return;
    }

    // TODO: Wire to GitLogReader.getLog() and subscribe to git:commit events.
    setSelectedIndex(0);
  }, [repoPath]);

  return { commits, selectedIndex, moveUp, moveDown };
}
