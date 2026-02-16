import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { PreviewPanel } from './PreviewPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('PreviewPanel', () => {
  it('renders content lines', () => {
    const { lastFrame } = renderWithTheme(
      <PreviewPanel
        title="README.md"
        lines={['# Hello', 'World', 'Line 3']}
        scrollOffset={0}
        maxLines={10}
      />,
    );
    expect(lastFrame()).toContain('README.md');
    expect(lastFrame()).toContain('# Hello');
    expect(lastFrame()).toContain('World');
  });

  it('renders empty state', () => {
    const { lastFrame } = renderWithTheme(
      <PreviewPanel title="empty.txt" lines={[]} scrollOffset={0} maxLines={10} />,
    );
    expect(lastFrame()).toContain('No content');
  });

  it('shows truncation indicator when scrolled', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`);
    const { lastFrame } = renderWithTheme(
      <PreviewPanel title="long.txt" lines={lines} scrollOffset={0} maxLines={5} />,
    );
    expect(lastFrame()).toContain('more lines');
  });
});
