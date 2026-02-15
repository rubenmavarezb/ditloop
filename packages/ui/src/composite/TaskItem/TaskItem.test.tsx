import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { TaskItem } from './TaskItem.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import type { TaskItemData } from './TaskItem.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('TaskItem', () => {
  it('renders task title', () => {
    const task: TaskItemData = {
      title: 'Fix login bug',
      status: 'active',
      updatedAt: new Date(),
    };
    const { lastFrame } = renderWithTheme(
      <TaskItem task={task} isSelected={false} />
    );
    expect(lastFrame()).toContain('Fix login bug');
  });

  it('shows active icon for active tasks', () => {
    const task: TaskItemData = {
      title: 'Active task',
      status: 'active',
      updatedAt: new Date(),
    };
    const { lastFrame } = renderWithTheme(
      <TaskItem task={task} isSelected={false} />
    );
    expect(lastFrame()).toContain('●');
  });

  it('shows completed icon for completed tasks', () => {
    const task: TaskItemData = {
      title: 'Done task',
      status: 'completed',
      updatedAt: new Date(),
    };
    const { lastFrame } = renderWithTheme(
      <TaskItem task={task} isSelected={false} />
    );
    expect(lastFrame()).toContain('✓');
  });

  it('shows pending icon for pending tasks', () => {
    const task: TaskItemData = {
      title: 'Pending task',
      status: 'pending',
      updatedAt: new Date(),
    };
    const { lastFrame } = renderWithTheme(
      <TaskItem task={task} isSelected={false} />
    );
    expect(lastFrame()).toContain('○');
  });

  it('shows selection indicator when selected', () => {
    const task: TaskItemData = {
      title: 'Selected task',
      status: 'active',
      updatedAt: new Date(),
    };
    const { lastFrame } = renderWithTheme(
      <TaskItem task={task} isSelected={true} />
    );
    expect(lastFrame()).toContain('❯');
  });
});
