import { describe, it, expect } from 'vitest';
import { GitWorktreeReader } from './git-worktree-reader.js';

describe('GitWorktreeReader', () => {
  it('parses porcelain worktree output', () => {
    // Access the private method via prototype for testing
    const reader = new GitWorktreeReader({ repoPath: '.' });
    const parsed = (reader as any).parseWorktreeOutput(`worktree /home/user/repo
HEAD abc1234567890
branch refs/heads/main

worktree /home/user/repo-feature
HEAD def5678901234
branch refs/heads/feature/foo

`);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      path: '/home/user/repo',
      branch: 'main',
      head: 'abc1234567890',
      isMain: true,
    });
    expect(parsed[1]).toEqual({
      path: '/home/user/repo-feature',
      branch: 'feature/foo',
      head: 'def5678901234',
      isMain: false,
    });
  });

  it('handles detached HEAD worktree', () => {
    const reader = new GitWorktreeReader({ repoPath: '.' });
    const parsed = (reader as any).parseWorktreeOutput(`worktree /home/user/repo
HEAD abc1234567890
branch refs/heads/main

worktree /home/user/repo-detached
HEAD 999888777666
detached

`);

    expect(parsed).toHaveLength(2);
    expect(parsed[1].branch).toBe('');
  });

  it('handles empty output', () => {
    const reader = new GitWorktreeReader({ repoPath: '.' });
    const parsed = (reader as any).parseWorktreeOutput('');
    expect(parsed).toEqual([]);
  });
});
