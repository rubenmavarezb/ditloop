import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { FuzzyFinder } from './FuzzyFinder.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('FuzzyFinder', () => {
  it('renders nothing when not visible', () => {
    const { lastFrame } = renderWithTheme(
      <FuzzyFinder
        visible={false}
        query=""
        results={[]}
        selectedIndex={0}
        termWidth={80}
        termHeight={24}
      />,
    );
    expect(lastFrame()).toBe('');
  });

  it('renders search prompt when visible', () => {
    const { lastFrame } = renderWithTheme(
      <FuzzyFinder
        visible={true}
        query=""
        results={[]}
        selectedIndex={0}
        termWidth={80}
        termHeight={24}
      />,
    );
    expect(lastFrame()).toContain('Fuzzy Finder');
    expect(lastFrame()).toContain('Type to search');
  });

  it('renders results with category badges', () => {
    const { lastFrame } = renderWithTheme(
      <FuzzyFinder
        visible={true}
        query="main"
        results={[
          { label: 'main', category: 'branch' },
          { label: 'ditloop-main', category: 'ws', meta: '~/code' },
        ]}
        selectedIndex={0}
        termWidth={80}
        termHeight={24}
      />,
    );
    expect(lastFrame()).toContain('[branch]');
    expect(lastFrame()).toContain('[ws]');
    expect(lastFrame()).toContain('main');
    expect(lastFrame()).toContain('~/code');
  });

  it('shows no matches when query has no results', () => {
    const { lastFrame } = renderWithTheme(
      <FuzzyFinder
        visible={true}
        query="nonexistent"
        results={[]}
        selectedIndex={0}
        termWidth={80}
        termHeight={24}
      />,
    );
    expect(lastFrame()).toContain('No matches');
  });

  it('highlights selected item', () => {
    const { lastFrame } = renderWithTheme(
      <FuzzyFinder
        visible={true}
        query="t"
        results={[
          { label: 'task-1', category: 'task' },
          { label: 'task-2', category: 'task' },
        ]}
        selectedIndex={1}
        termWidth={80}
        termHeight={24}
      />,
    );
    // Second item should have > indicator
    const frame = lastFrame() ?? '';
    const lines = frame.split('\n');
    const taskLines = lines.filter((l) => l.includes('task-'));
    expect(taskLines.length).toBe(2);
  });
});
