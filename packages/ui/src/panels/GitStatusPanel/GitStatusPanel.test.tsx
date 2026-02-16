import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { GitStatusPanel } from './GitStatusPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('GitStatusPanel', () => {
  it('renders clean working tree message', () => {
    const { lastFrame } = renderWithTheme(
      <GitStatusPanel staged={[]} unstaged={[]} untracked={[]} selectedIndex={0} />,
    );
    expect(lastFrame()).toContain('Clean working tree');
  });

  it('renders staged files section', () => {
    const { lastFrame } = renderWithTheme(
      <GitStatusPanel
        staged={[{ path: 'file.ts', status: 'M' }]}
        unstaged={[]}
        untracked={[]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('Staged (1)');
    expect(lastFrame()).toContain('file.ts');
  });

  it('renders unstaged files section', () => {
    const { lastFrame } = renderWithTheme(
      <GitStatusPanel
        staged={[]}
        unstaged={[{ path: 'app.tsx', status: 'M' }]}
        untracked={[]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('Unstaged (1)');
    expect(lastFrame()).toContain('app.tsx');
  });

  it('renders untracked files section', () => {
    const { lastFrame } = renderWithTheme(
      <GitStatusPanel
        staged={[]}
        unstaged={[]}
        untracked={['new-file.ts']}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('Untracked (1)');
    expect(lastFrame()).toContain('new-file.ts');
  });

  it('renders all sections together', () => {
    const { lastFrame } = renderWithTheme(
      <GitStatusPanel
        staged={[{ path: 'a.ts', status: 'A' }]}
        unstaged={[{ path: 'b.ts', status: 'M' }]}
        untracked={['c.ts']}
        selectedIndex={1}
      />,
    );
    expect(lastFrame()).toContain('Staged');
    expect(lastFrame()).toContain('Unstaged');
    expect(lastFrame()).toContain('Untracked');
  });
});
