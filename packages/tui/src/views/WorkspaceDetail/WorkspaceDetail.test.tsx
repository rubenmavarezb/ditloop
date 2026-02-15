import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { WorkspaceDetail } from './WorkspaceDetail.js';
import type { GitStatus } from '@ditloop/core';

const mockWorkspace = {
  name: 'Test Workspace',
  type: 'single' as const,
  projectCount: 1,
  status: 'active' as const,
};

const mockGitStatus: GitStatus = {
  currentBranch: 'main',
  tracking: 'origin/main',
  ahead: 2,
  behind: 0,
  staged: [{ path: 'file.ts', index: 'M', working_dir: ' ' }],
  unstaged: [{ path: 'other.ts', index: ' ', working_dir: 'M' }],
  untracked: ['new.ts'],
  isDirty: true,
  isDetachedHead: false,
};

describe('WorkspaceDetail', () => {
  it('renders workspace name', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail workspace={mockWorkspace} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Test Workspace');
  });

  it('renders git status panel', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail workspace={mockWorkspace} gitStatus={mockGitStatus} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('main');
    expect(lastFrame()).toContain('Staged: 1');
    expect(lastFrame()).toContain('Modified: 1');
    expect(lastFrame()).toContain('Untracked: 1');
  });

  it('renders identity panel', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail
          workspace={mockWorkspace}
          identityMatch={true}
          profileName="personal"
        />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('personal');
    expect(lastFrame()).toContain('Matched');
  });

  it('renders identity mismatch', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail
          workspace={mockWorkspace}
          identityMatch={false}
          profileName="work"
        />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Mismatch');
  });

  it('renders AIDF tasks panel', () => {
    const tasks = [
      { id: '1', title: 'Task 1', status: 'pending' },
      { id: '2', title: 'Task 2', status: 'in-progress' },
      { id: '3', title: 'Task 3', status: 'done' },
    ];

    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail workspace={mockWorkspace} tasks={tasks} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('In Progress: 1');
    expect(lastFrame()).toContain('Pending: 1');
    expect(lastFrame()).toContain('Done: 1');
  });

  it('renders quick actions panel', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail workspace={mockWorkspace} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('[c] Commit');
    expect(lastFrame()).toContain('[p] Push');
    expect(lastFrame()).toContain('[b] Branches');
  });

  it('shows empty state for tasks', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <WorkspaceDetail workspace={mockWorkspace} tasks={[]} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('No AIDF tasks found');
  });
});
