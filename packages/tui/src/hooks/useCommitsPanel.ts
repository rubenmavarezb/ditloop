import { useState, useEffect, useCallback } from 'react';
import { GitLogReader } from '@ditloop/core';
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
 * Format a Date into a relative time string (e.g., "2h", "3d", "1w").
 *
 * @param date - Date to format
 * @returns Relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo`;
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

    async function loadCommits() {
      try {
        let reader: GitLogReader;
        try {
          reader = new GitLogReader({ repoPath: repoPath! });
        } catch {
          return; // Directory may not exist
        }
        const entries = await reader.getLog({ maxCount: 30 });
        const parsed: PanelCommitEntry[] = entries.map((entry, index) => ({
          shortHash: entry.shortHash,
          author: entry.author,
          relativeTime: formatRelativeTime(entry.date),
          subject: entry.subject,
          isHead: index === 0,
          refs: entry.refs,
        }));
        setCommits(parsed);
        setSelectedIndex(0);
      } catch {
        setCommits([]);
      }
    }

    loadCommits();
  }, [repoPath]);

  return { commits, selectedIndex, moveUp, moveDown };
}
