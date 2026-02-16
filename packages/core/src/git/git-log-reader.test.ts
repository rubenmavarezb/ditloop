import { describe, it, expect } from 'vitest';
import { GitLogReader } from './git-log-reader.js';

describe('GitLogReader', () => {
  it('parses log output into commit entries', () => {
    const reader = new GitLogReader({ repoPath: '.' });
    const parsed = (reader as any).parseLogOutput(
`abc1234567890abcdef1234567890abcdef123456
abc1234
Alice
2026-02-15T10:30:00+00:00
feat: add login feature
HEAD -> main, origin/main
---
def5678901234abcdef5678901234abcdef567890
def5678
Bob
2026-02-14T09:00:00+00:00
fix: resolve timeout issue

---
`);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      hash: 'abc1234567890abcdef1234567890abcdef123456',
      shortHash: 'abc1234',
      author: 'Alice',
      date: new Date('2026-02-15T10:30:00+00:00'),
      subject: 'feat: add login feature',
      refs: ['HEAD -> main', 'origin/main'],
    });
    expect(parsed[1].refs).toEqual([]);
    expect(parsed[1].author).toBe('Bob');
  });

  it('handles empty output', () => {
    const reader = new GitLogReader({ repoPath: '.' });
    const parsed = (reader as any).parseLogOutput('');
    expect(parsed).toEqual([]);
  });
});
