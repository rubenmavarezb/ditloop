import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { CommandLogPanel } from './CommandLogPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('CommandLogPanel', () => {
  it('renders command entries', () => {
    const { lastFrame } = renderWithTheme(
      <CommandLogPanel
        entries={[
          { time: '12:00:00', command: 'git status', exitCode: 0, durationMs: 120 },
          { time: '12:00:05', command: 'git push', exitCode: 1, durationMs: 3500 },
        ]}
        maxEntries={10}
      />,
    );
    expect(lastFrame()).toContain('git status');
    expect(lastFrame()).toContain('✓');
    expect(lastFrame()).toContain('120ms');
    expect(lastFrame()).toContain('git push');
    expect(lastFrame()).toContain('✗');
    expect(lastFrame()).toContain('3.5s');
  });

  it('renders empty state', () => {
    const { lastFrame } = renderWithTheme(
      <CommandLogPanel entries={[]} maxEntries={10} />,
    );
    expect(lastFrame()).toContain('No commands executed');
  });

  it('respects maxEntries', () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({
      time: `12:00:0${i}`,
      command: `cmd-${i}`,
      exitCode: 0,
      durationMs: 100,
    }));
    const { lastFrame } = renderWithTheme(
      <CommandLogPanel entries={entries} maxEntries={2} />,
    );
    expect(lastFrame()).toContain('cmd-0');
    expect(lastFrame()).toContain('cmd-1');
    expect(lastFrame()).not.toContain('cmd-2');
  });
});
