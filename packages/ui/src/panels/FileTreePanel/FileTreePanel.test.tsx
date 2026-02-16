import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { FileTreePanel } from './FileTreePanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('FileTreePanel', () => {
  it('renders file tree nodes', () => {
    const { lastFrame } = renderWithTheme(
      <FileTreePanel
        nodes={[
          { name: 'src', path: 'src', isDirectory: true, depth: 0, expanded: true },
          { name: 'index.ts', path: 'src/index.ts', isDirectory: false, depth: 1 },
          { name: 'utils', path: 'src/utils', isDirectory: true, depth: 1, expanded: false },
        ]}
        selectedIndex={0}
      />,
    );
    expect(lastFrame()).toContain('src');
    expect(lastFrame()).toContain('index.ts');
    expect(lastFrame()).toContain('utils');
  });

  it('renders empty state', () => {
    const { lastFrame } = renderWithTheme(
      <FileTreePanel nodes={[]} selectedIndex={0} />,
    );
    expect(lastFrame()).toContain('No files');
  });

  it('shows directory chevron indicators', () => {
    const { lastFrame } = renderWithTheme(
      <FileTreePanel
        nodes={[
          { name: 'open-dir', path: 'open-dir', isDirectory: true, depth: 0, expanded: true },
          { name: 'closed-dir', path: 'closed-dir', isDirectory: true, depth: 0, expanded: false },
        ]}
        selectedIndex={-1}
      />,
    );
    expect(lastFrame()).toContain('▼');
    expect(lastFrame()).toContain('▶');
  });
});
