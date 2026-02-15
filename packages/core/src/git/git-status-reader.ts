import simpleGit, { type SimpleGit, type StatusResult, type BranchSummary } from 'simple-git';
import type { EventBus } from '../events/index.js';

/** A file entry with its path and git status code. */
export interface GitFileEntry {
  path: string;
  index: string;
  working_dir: string;
}

/** Snapshot of a git repository's current status. */
export interface GitStatus {
  currentBranch: string;
  tracking: string | null;
  ahead: number;
  behind: number;
  staged: GitFileEntry[];
  unstaged: GitFileEntry[];
  untracked: string[];
  isDirty: boolean;
  isDetachedHead: boolean;
}

/** Options for constructing a GitStatusReader. */
export interface GitStatusReaderOptions {
  repoPath: string;
  workspace: string;
  eventBus?: EventBus;
  pollInterval?: number;
}

/**
 * Reads and monitors git repository status including branch info,
 * staged/unstaged/untracked files, and ahead/behind tracking.
 */
export class GitStatusReader {
  private git: SimpleGit;
  private workspace: string;
  private eventBus?: EventBus;
  private pollInterval: number;
  private pollTimer?: ReturnType<typeof setInterval>;
  private lastStatus?: GitStatus;

  constructor(options: GitStatusReaderOptions) {
    this.git = simpleGit(options.repoPath);
    this.workspace = options.workspace;
    this.eventBus = options.eventBus;
    this.pollInterval = options.pollInterval ?? 2000;
  }

  /**
   * Read the current git status of the repository.
   *
   * @returns Current git status snapshot
   */
  async getStatus(): Promise<GitStatus> {
    const [statusResult, branchResult] = await Promise.all([
      this.git.status(),
      this.git.branch(),
    ]);

    const status = this.mapStatus(statusResult, branchResult);

    if (this.eventBus && this.hasChanged(status)) {
      this.eventBus.emit('git:status-changed', {
        workspace: this.workspace,
        branch: status.currentBranch,
        modified: status.unstaged.length,
        staged: status.staged.length,
        untracked: status.untracked.length,
      });
    }

    this.lastStatus = status;
    return status;
  }

  /**
   * Start polling git status at the configured interval.
   * Emits git:status-changed events when status changes.
   */
  startPolling(): void {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(async () => {
      try {
        await this.getStatus();
      } catch {
        // Silently ignore poll errors — repo may be temporarily unavailable
      }
    }, this.pollInterval);
  }

  /**
   * Stop polling git status.
   */
  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  /**
   * Get the underlying simple-git instance for advanced operations.
   *
   * @returns The simple-git instance bound to this repo
   */
  getGit(): SimpleGit {
    return this.git;
  }

  private mapStatus(status: StatusResult, branch: BranchSummary): GitStatus {
    const isDetached = status.current === null || status.current === 'HEAD';
    const currentBranch: string = isDetached
      ? (status.current ?? 'HEAD (detached)')
      : (status.current ?? 'unknown');

    const staged: GitFileEntry[] = status.staged.map((path) => ({
      path,
      index: this.findFileIndex(status, path),
      working_dir: ' ',
    }));

    const unstaged: GitFileEntry[] = status.modified
      .filter((path) => !status.staged.includes(path))
      .map((path) => ({
        path,
        index: ' ',
        working_dir: 'M',
      }));

    // Also include deleted files in unstaged
    for (const path of status.deleted) {
      if (!status.staged.includes(path)) {
        unstaged.push({ path, index: ' ', working_dir: 'D' });
      }
    }

    return {
      currentBranch,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      staged,
      unstaged,
      untracked: status.not_added,
      isDirty: !status.isClean(),
      isDetachedHead: isDetached,
    };
  }

  private findFileIndex(status: StatusResult, path: string): string {
    if (status.created.includes(path)) return 'A';
    if (status.deleted.includes(path)) return 'D';
    if (status.renamed.some((r) => r.to === path)) return 'R';
    return 'M';
  }

  private hasChanged(current: GitStatus): boolean {
    if (!this.lastStatus) return true;

    const prev = this.lastStatus;
    return (
      current.currentBranch !== prev.currentBranch ||
      current.ahead !== prev.ahead ||
      current.behind !== prev.behind ||
      current.staged.length !== prev.staged.length ||
      current.unstaged.length !== prev.unstaged.length ||
      current.untracked.length !== prev.untracked.length ||
      current.isDirty !== prev.isDirty
    );
  }
}
