import simpleGit, { type SimpleGit } from 'simple-git';

/** A single commit entry. */
export interface CommitEntry {
  /** Full commit hash. */
  hash: string;
  /** Abbreviated hash (7 chars). */
  shortHash: string;
  /** Author name. */
  author: string;
  /** Commit date. */
  date: Date;
  /** Commit subject line. */
  subject: string;
  /** Ref names (branches, tags) pointing to this commit. */
  refs: string[];
}

/** Options for reading git log. */
export interface GitLogOptions {
  /** Maximum number of commits to return. Defaults to 50. */
  maxCount?: number;
  /** Branch to read log from. Defaults to current branch. */
  branch?: string;
}

/** Options for constructing a GitLogReader. */
export interface GitLogReaderOptions {
  repoPath: string;
}

/**
 * Read git commit log from a repository.
 */
export class GitLogReader {
  private git: SimpleGit;

  constructor(options: GitLogReaderOptions) {
    this.git = simpleGit(options.repoPath);
  }

  /**
   * Get the commit log for a branch.
   *
   * @param options - Log options (maxCount, branch)
   * @returns Array of commit entries, newest first
   */
  async getLog(options?: GitLogOptions): Promise<CommitEntry[]> {
    const maxCount = options?.maxCount ?? 50;
    const args = [`-${maxCount}`, '--format=%H%n%h%n%an%n%aI%n%s%n%D%n---'];

    if (options?.branch) {
      args.push(options.branch);
    }

    try {
      const raw = await this.git.raw(['log', ...args]);
      return this.parseLogOutput(raw);
    } catch {
      return [];
    }
  }

  /**
   * Parse raw git log output into commit entries.
   *
   * @param raw - Raw log output
   * @returns Parsed commit entries
   */
  private parseLogOutput(raw: string): CommitEntry[] {
    const entries: CommitEntry[] = [];
    const blocks = raw.trim().split('---\n');

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n');
      if (lines.length < 5) continue;

      const hash = lines[0];
      const shortHash = lines[1];
      const author = lines[2];
      const date = new Date(lines[3]);
      const subject = lines[4];
      const refLine = lines[5] ?? '';
      const refs = refLine
        ? refLine.split(',').map((r) => r.trim()).filter(Boolean)
        : [];

      entries.push({ hash, shortHash, author, date, subject, refs });
    }

    return entries;
  }
}
