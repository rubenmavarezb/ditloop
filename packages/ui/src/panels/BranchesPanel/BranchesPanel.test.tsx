import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { BranchesPanel } from './BranchesPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('BranchesPanel', () => {
  it('renders local branches', () => {
    const { lastFrame } = renderWithTheme(
      <BranchesPanel
        local={[
          { name: 'main', isCurrent: true, ahead: 0, behind: 0, isRemote: false },
          { name: 'feature', isCurrent: false, ahead: 2, behind: 1, isRemote: false },
        ]}
        remote={[]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('Local (2)');
    expect(lastFrame()).toContain('main');
    expect(lastFrame()).toContain('feature');
  });

  it('marks current branch', () => {
    const { lastFrame } = renderWithTheme(
      <BranchesPanel
        local={[{ name: 'main', isCurrent: true, ahead: 0, behind: 0, isRemote: false }]}
        remote={[]}
        selectedIndex={-1}
      />,
    );
    expect(lastFrame()).toContain('* main');
  });

  it('shows worktree path', () => {
    const { lastFrame } = renderWithTheme(
      <BranchesPanel
        local={[
          { name: 'wt-branch', isCurrent: false, ahead: 0, behind: 0, isRemote: false, worktreePath: '/tmp/wt' },
        ]}
        remote={[]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('[wt: /tmp/wt]');
  });

  it('renders remote branches', () => {
    const { lastFrame } = renderWithTheme(
      <BranchesPanel
        local={[]}
        remote={[{ name: 'origin/main', isCurrent: false, ahead: 0, behind: 0, isRemote: true }]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('Remote (1)');
    expect(lastFrame()).toContain('origin/main');
  });
});
