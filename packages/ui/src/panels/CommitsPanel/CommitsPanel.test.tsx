import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { CommitsPanel } from './CommitsPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('CommitsPanel', () => {
  it('renders commits', () => {
    const { lastFrame } = renderWithTheme(
      <CommitsPanel
        commits={[
          { shortHash: 'abc1234', author: 'Alice', relativeTime: '2h', subject: 'feat: login', isHead: true, refs: ['HEAD -> main'] },
          { shortHash: 'def5678', author: 'Bob', relativeTime: '1d', subject: 'fix: bug', isHead: false, refs: [] },
        ]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('abc1234');
    expect(lastFrame()).toContain('Alice');
    expect(lastFrame()).toContain('feat: login');
    expect(lastFrame()).toContain('def5678');
  });

  it('renders empty state', () => {
    const { lastFrame } = renderWithTheme(
      <CommitsPanel commits={[]} selectedIndex={0} />,
    );
    expect(lastFrame()).toContain('No commits');
  });

  it('shows ref badges', () => {
    const { lastFrame } = renderWithTheme(
      <CommitsPanel
        commits={[
          { shortHash: 'aaa1111', author: 'Dev', relativeTime: '1h', subject: 'release', isHead: true, refs: ['tag: v1.0'] },
        ]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('tag: v1.0');
  });
});
