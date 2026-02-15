import type { SimpleGit } from 'simple-git';
import type { EventBus } from '../events/index.js';
import type { IdentityGuard } from '../profile/index.js';

/** Summary of a git branch. */
export interface BranchInfo {
  name: string;
  current: boolean;
  commit: string;
  label: string;
}

/** Options for constructing a GitBranchManager. */
export interface GitBranchManagerOptions {
  git: SimpleGit;
  workspace: string;
  profileName: string;
  eventBus?: EventBus;
  identityGuard?: IdentityGuard;
}

/**
 * Manages git branches: list, create, switch, delete, and remote operations
 * with identity validation for write operations.
 */
export class GitBranchManager {
  private git: SimpleGit;
  private workspace: string;
  private profileName: string;
  private eventBus?: EventBus;
  private identityGuard?: IdentityGuard;

  constructor(options: GitBranchManagerOptions) {
    this.git = options.git;
    this.workspace = options.workspace;
    this.profileName = options.profileName;
    this.eventBus = options.eventBus;
    this.identityGuard = options.identityGuard;
  }

  /**
   * List all local branches.
   *
   * @returns Array of branch information
   */
  async listBranches(): Promise<BranchInfo[]> {
    const result = await this.git.branch();
    return Object.values(result.branches).map((b) => ({
      name: b.name,
      current: b.current,
      commit: b.commit,
      label: b.label,
    }));
  }

  /**
   * Create a new branch from the current HEAD or a specified start point.
   *
   * @param name - Name of the new branch
   * @param startPoint - Optional commit/branch to start from
   */
  async createBranch(name: string, startPoint?: string): Promise<void> {
    if (startPoint) {
      await this.git.branch([name, startPoint]);
      await this.git.checkout(name);
    } else {
      await this.git.checkoutLocalBranch(name);
    }

    if (this.eventBus) {
      this.eventBus.emit('git:branch-created', {
        workspace: this.workspace,
        branch: name,
      });
    }
  }

  /**
   * Switch to an existing branch.
   *
   * @param name - Name of the branch to switch to
   */
  async switchBranch(name: string): Promise<void> {
    await this.git.checkout(name);

    if (this.eventBus) {
      this.eventBus.emit('git:branch-switched', {
        workspace: this.workspace,
        branch: name,
      });
    }
  }

  /**
   * Delete a local branch.
   *
   * @param name - Name of the branch to delete
   * @param force - Force delete even if not merged
   */
  async deleteBranch(name: string, force = false): Promise<void> {
    if (force) {
      await this.git.branch(['-D', name]);
    } else {
      await this.git.branch(['-d', name]);
    }

    if (this.eventBus) {
      this.eventBus.emit('git:branch-deleted', {
        workspace: this.workspace,
        branch: name,
      });
    }
  }

  /**
   * Detect the default branch of the repository.
   * Checks origin/HEAD first, then falls back to main/master/develop.
   *
   * @returns The detected default branch name, or undefined if not found
   */
  async detectDefaultBranch(): Promise<string | undefined> {
    // Try origin/HEAD
    try {
      const result = await this.git.raw(['symbolic-ref', 'refs/remotes/origin/HEAD']);
      const match = result.trim().match(/refs\/remotes\/origin\/(.+)/);
      if (match) return match[1];
    } catch {
      // No origin/HEAD set
    }

    // Fallback: check which standard branches exist in remote
    try {
      const result = await this.git.branch(['-r']);
      const branches = Object.keys(result.branches);
      for (const candidate of ['origin/main', 'origin/master', 'origin/develop']) {
        if (branches.includes(candidate)) {
          return candidate.replace('origin/', '');
        }
      }
    } catch {
      // No remote branches
    }

    // Fallback: check local branches
    try {
      const result = await this.git.branch();
      for (const candidate of ['main', 'master', 'develop']) {
        if (result.all.includes(candidate)) {
          return candidate;
        }
      }
    } catch {
      // No branches at all
    }

    return undefined;
  }

  /**
   * Push current branch to remote. Validates identity before pushing.
   *
   * @param remote - Remote name (default: 'origin')
   * @param branch - Branch to push (default: current branch)
   * @param options - Optional: setUpstream to set tracking
   * @throws Error if identity validation fails
   */
  async push(remote = 'origin', branch?: string, options?: { setUpstream?: boolean }): Promise<void> {
    await this.validateIdentity();

    const branchName = branch ?? (await this.getCurrentBranch());
    const args: string[] = [];

    if (options?.setUpstream) {
      args.push('-u');
    }

    await this.git.push(remote, branchName, args);

    if (this.eventBus) {
      this.eventBus.emit('git:push', {
        workspace: this.workspace,
        branch: branchName,
        remote,
      });
    }
  }

  /**
   * Pull from remote. Validates identity before pulling.
   *
   * @param remote - Remote name (default: 'origin')
   * @param branch - Branch to pull (default: current branch)
   * @throws Error if identity validation fails
   */
  async pull(remote = 'origin', branch?: string): Promise<void> {
    await this.validateIdentity();

    const branchName = branch ?? (await this.getCurrentBranch());
    await this.git.pull(remote, branchName);

    if (this.eventBus) {
      this.eventBus.emit('git:pull', {
        workspace: this.workspace,
        branch: branchName,
      });
    }
  }

  /**
   * Get the current branch name.
   *
   * @returns Current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const result = await this.git.branch();
    return result.current;
  }

  private async validateIdentity(): Promise<void> {
    if (!this.identityGuard) return;

    const allowed = await this.identityGuard.guard(this.profileName, this.workspace);
    if (!allowed) {
      throw new Error(
        `Identity mismatch for workspace "${this.workspace}". ` +
        `Expected profile "${this.profileName}". Operation blocked.`,
      );
    }
  }
}
