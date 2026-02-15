import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { TaskDetail } from './TaskDetail.js';
import { ThemeProvider } from '@ditloop/ui';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('TaskDetail', () => {
  it('renders task title from props', () => {
    const { lastFrame } = renderWithTheme(
      <TaskDetail title="Fix login bug" />
    );
    expect(lastFrame()).toContain('Fix login bug');
  });

  it('renders task status', () => {
    const { lastFrame } = renderWithTheme(
      <TaskDetail title="Deploy" status="in-progress" />
    );
    expect(lastFrame()).toContain('Status: in-progress');
  });

  it('renders task description', () => {
    const { lastFrame } = renderWithTheme(
      <TaskDetail title="Deploy" description="Deploy to production env" />
    );
    expect(lastFrame()).toContain('Deploy to production env');
  });

  it('renders placeholder content when no task data', () => {
    const { lastFrame } = renderWithTheme(
      <TaskDetail />
    );
    expect(lastFrame()).toContain('No task selected');
  });

  it('renders the panel title', () => {
    const { lastFrame } = renderWithTheme(
      <TaskDetail />
    );
    expect(lastFrame()).toContain('Task Detail');
  });
});
