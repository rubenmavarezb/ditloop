import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { TasksPanel } from './TasksPanel.js';
import type { PanelTaskEntry } from './TasksPanel.js';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

const sampleTasks: PanelTaskEntry[] = [
  { id: 'TASK-001', title: 'Setup project', status: 'done' },
  { id: 'TASK-002', title: 'Add tests', status: 'in-progress' },
  { id: 'TASK-003', title: 'Deploy', status: 'pending' },
  { id: 'TASK-004', title: 'Blocked feature', status: 'blocked' },
];

describe('TasksPanel', () => {
  it('renders all tasks', () => {
    const { lastFrame } = renderWithTheme(
      <TasksPanel tasks={sampleTasks} selectedIndex={0} filter={null} />,
    );
    expect(lastFrame()).toContain('TASK-001');
    expect(lastFrame()).toContain('TASK-002');
    expect(lastFrame()).toContain('[1/4]');
  });

  it('renders empty state', () => {
    const { lastFrame } = renderWithTheme(
      <TasksPanel tasks={[]} selectedIndex={0} filter={null} />,
    );
    expect(lastFrame()).toContain('No tasks found');
  });

  it('filters by status', () => {
    const { lastFrame } = renderWithTheme(
      <TasksPanel tasks={sampleTasks} selectedIndex={0} filter="done" />,
    );
    expect(lastFrame()).toContain('TASK-001');
    expect(lastFrame()).not.toContain('TASK-002');
    expect(lastFrame()).toContain('filter: done');
  });

  it('shows status icons', () => {
    const { lastFrame } = renderWithTheme(
      <TasksPanel tasks={sampleTasks} selectedIndex={0} filter={null} />,
    );
    expect(lastFrame()).toContain('●'); // done
    expect(lastFrame()).toContain('◐'); // in-progress
    expect(lastFrame()).toContain('○'); // pending
    expect(lastFrame()).toContain('✕'); // blocked
  });
});
