import { useState, useEffect, useCallback } from 'react';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { PanelBranchEntry } from '@ditloop/ui';

const execFileAsync = promisify(execFile);

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
 * Hook that manages branches panel state with real git data.
 * Reads local and remote branches from the repository.
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

    async function loadBranches() {
      try {
        // Get local branches with ahead/behind info
        const { stdout: localOut } = await execFileAsync('git', [
          'branch', '-v', '--format=%(refname:short)\t%(HEAD)\t%(upstream:trackshort)',
        ], { cwd: repoPath! });

        const localBranches: PanelBranchEntry[] = localOut.trim().split('\n').filter(Boolean).map((line) => {
          const [name, head, trackShort] = line.split('\t');
          const isCurrent = head === '*';
          let ahead = 0;
          let behind = 0;
          if (trackShort) {
            const aheadMatch = trackShort.match(/>(\d+)?/);
            const behindMatch = trackShort.match(/<(\d+)?/);
            if (aheadMatch) ahead = parseInt(aheadMatch[1] ?? '1', 10);
            if (behindMatch) behind = parseInt(behindMatch[1] ?? '1', 10);
          }
          return { name, isCurrent, ahead, behind, isRemote: false };
        });

        // Get remote branches
        const { stdout: remoteOut } = await execFileAsync('git', [
          'branch', '-r', '--format=%(refname:short)',
        ], { cwd: repoPath! });

        const remoteBranches: PanelBranchEntry[] = remoteOut.trim().split('\n')
          .filter((line) => line && !line.includes('HEAD'))
          .map((name) => ({
            name: name.trim(),
            isCurrent: false,
            ahead: 0,
            behind: 0,
            isRemote: true,
          }));

        setLocal(localBranches);
        setRemote(remoteBranches);
        setSelectedIndex(0);
      } catch {
        setLocal([]);
        setRemote([]);
      }
    }

    loadBranches();
  }, [repoPath]);

  return { local, remote, selectedIndex, moveUp, moveDown, totalBranches };
}
