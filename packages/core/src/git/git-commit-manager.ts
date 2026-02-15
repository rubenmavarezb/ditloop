import type { SimpleGit } from 'simple-git';
import type { EventBus } from '../events/index.js';
import type { IdentityGuard } from '../profile/index.js';

/** Conventional commit types. */
export const CONVENTIONAL_TYPES = [
  'feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'style', 'perf', 'ci', 'build', 'revert',
] as const;

/** Regex for conventional commit format: type(scope): subject */
const CONVENTIONAL_RE = /^(feat|fix|refactor|test|docs|chore|style|perf|ci|build|revert)(\(.+\))?!?: .+/;

/** Result of a commit operation. */
export interface CommitResult {
  hash: string;
  message: string;
  dryRun: boolean;
}

/** Options for constructing a GitCommitManager. */
export interface GitCommitManagerOptions {
  git: SimpleGit;
  workspace: string;
  profileName: string;
  eventBus?: EventBus;
  identityGuard?: IdentityGuard;
}

/**
 * Handles staging files and creating commits with conventional commit format
 * and identity validation.
 */
export class GitCommitManager {
  private git: SimpleGit;
  private workspace: string;
  private profileName: string;
  private eventBus?: EventBus;
  private identityGuard?: IdentityGuard;

  constructor(options: GitCommitManagerOptions) {
    this.git = options.git;
    this.workspace = options.workspace;
    this.profileName = options.profileName;
    this.eventBus = options.eventBus;
    this.identityGuard = options.identityGuard;
  }

  /**
   * Stage files for commit.
   *
   * @param files - Array of file paths to stage
   */
  async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    await this.git.add(files);
  }

  /**
   * Unstage files from the staging area.
   *
   * @param files - Array of file paths to unstage
   */
  async unstageFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    await this.git.reset(['HEAD', '--', ...files]);
  }

  /**
   * Create a commit with the given message. Validates identity and conventional
   * commit format before committing.
   *
   * @param message - Commit message in conventional format
   * @param options - Optional: dryRun to skip actual commit
   * @returns Commit result with hash and message
   * @throws Error if identity validation fails or message format is invalid
   */
  async commit(message: string, options?: { dryRun?: boolean }): Promise<CommitResult> {
    this.validateConventionalFormat(message);
    await this.validateIdentity();

    if (options?.dryRun) {
      return { hash: '(dry-run)', message, dryRun: true };
    }

    const result = await this.git.commit(message);
    const hash = result.commit || '';

    if (this.eventBus && hash) {
      this.eventBus.emit('git:commit', {
        workspace: this.workspace,
        hash,
        message,
      });
    }

    return { hash, message, dryRun: false };
  }

  /**
   * Amend the last commit with a new message and/or staged changes.
   *
   * @param message - New commit message (optional, keeps previous if omitted)
   * @returns Commit result with the amended hash
   * @throws Error if identity validation fails
   */
  async amendCommit(message?: string): Promise<CommitResult> {
    if (message) {
      this.validateConventionalFormat(message);
    }
    await this.validateIdentity();

    const args = ['--amend'];
    if (message) {
      args.push('-m', message);
    } else {
      args.push('--no-edit');
    }

    const result = await this.git.commit(message ?? '', args);
    const hash = result.commit || '';
    const finalMessage = message ?? '(amended)';

    if (this.eventBus && hash) {
      this.eventBus.emit('git:commit', {
        workspace: this.workspace,
        hash,
        message: finalMessage,
      });
    }

    return { hash, message: finalMessage, dryRun: false };
  }

  /**
   * Validate that a commit message follows the conventional commit format.
   *
   * @param message - The commit message to validate
   * @returns true if valid
   * @throws Error if the message does not match conventional format
   */
  validateConventionalFormat(message: string): boolean {
    if (!CONVENTIONAL_RE.test(message)) {
      throw new Error(
        `Invalid conventional commit format: "${message}". ` +
        `Expected: type(scope): subject (e.g., "feat(git): add commit manager")`,
      );
    }
    return true;
  }

  private async validateIdentity(): Promise<void> {
    if (!this.identityGuard) return;

    const allowed = await this.identityGuard.guard(this.profileName, this.workspace);
    if (!allowed) {
      throw new Error(
        `Identity mismatch for workspace "${this.workspace}". ` +
        `Expected profile "${this.profileName}". Commit blocked.`,
      );
    }
  }
}
