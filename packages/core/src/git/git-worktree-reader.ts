import simpleGit, { type SimpleGit } from 'simple-git';

/** A git worktree entry. */
export interface WorktreeEntry {
  /** Absolute path to the worktree. */
  path: string;
  /** Branch checked out in this worktree (empty if detached). */
  branch: string;
  /** HEAD commit hash. */
  head: string;
  /** Whether this is the main worktree. */
  isMain: boolean;
}

/** Options for constructing a GitWorktreeReader. */
export interface GitWorktreeReaderOptions {
  repoPath: string;
}

/**
 * Read git worktree information from a repository.
 */
export class GitWorktreeReader {
  private git: SimpleGit;

  constructor(options: GitWorktreeReaderOptions) {
    this.git = simpleGit(options.repoPath);
  }

  /**
   * List all worktrees for the repository.
   *
   * @returns Array of worktree entries
   */
  async listWorktrees(): Promise<WorktreeEntry[]> {
    try {
      const raw = await this.git.raw(['worktree', 'list', '--porcelain']);
      return this.parseWorktreeOutput(raw);
    } catch {
      return [];
    }
  }

  /**
   * Parse porcelain worktree list output into structured entries.
   *
   * @param raw - Raw output from `git worktree list --porcelain`
   * @returns Parsed worktree entries
   */
  private parseWorktreeOutput(raw: string): WorktreeEntry[] {
    const entries: WorktreeEntry[] = [];
    const blocks = raw.trim().split('\n\n');

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.trim().split('\n');
      let path = '';
      let head = '';
      let branch = '';
      let isMain = false;

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          path = line.slice('worktree '.length);
        } else if (line.startsWith('HEAD ')) {
          head = line.slice('HEAD '.length);
        } else if (line.startsWith('branch ')) {
          branch = line.slice('branch '.length).replace('refs/heads/', '');
        } else if (line === 'bare') {
          isMain = true;
        }
      }

      // First worktree entry is always the main one
      if (entries.length === 0) {
        isMain = true;
      }

      if (path) {
        entries.push({ path, branch, head, isMain });
      }
    }

    return entries;
  }
}
