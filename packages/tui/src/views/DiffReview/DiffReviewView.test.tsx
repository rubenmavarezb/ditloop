import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { DiffReviewView, assessRisk } from './DiffReviewView.js';
import type { ReviewableAction } from './DiffReviewView.js';

const mockActions: ReviewableAction[] = [
  {
    id: 'action-1',
    action: { type: 'file_create', path: 'src/new.ts', content: 'export const x = 1;' },
    diff: '--- a/src/new.ts\n+++ b/src/new.ts\n+export const x = 1;',
    risk: 'safe',
  },
  {
    id: 'action-2',
    action: { type: 'shell_command', command: 'npm test' },
    risk: 'safe',
  },
  {
    id: 'action-3',
    action: { type: 'shell_command', command: 'sudo rm -rf /' },
    risk: 'danger',
  },
];

describe('DiffReviewView', () => {
  it('renders action list', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={mockActions} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Create src/new.ts');
    expect(lastFrame()).toContain('Run: npm test');
  });

  it('renders counter', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={mockActions} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('1/3');
  });

  it('renders keyboard shortcuts', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={mockActions} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('approve');
    expect(lastFrame()).toContain('reject');
  });

  it('renders empty state', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={[]} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('No actions to review');
  });

  it('renders diff with colored lines', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={[mockActions[0]]} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('export const x = 1;');
  });

  it('shows risk badges', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <DiffReviewView actions={mockActions} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('safe');
    expect(lastFrame()).toContain('danger');
  });
});

describe('assessRisk', () => {
  it('returns safe for file operations', () => {
    expect(assessRisk({ type: 'file_create', path: 'test.ts', content: '' })).toBe('safe');
  });

  it('returns danger for rm commands', () => {
    expect(assessRisk({ type: 'shell_command', command: 'rm -rf /' })).toBe('danger');
  });

  it('returns caution for install commands', () => {
    expect(assessRisk({ type: 'shell_command', command: 'npm install lodash' })).toBe('caution');
  });

  it('returns caution for git push', () => {
    expect(assessRisk({ type: 'git_operation', operation: 'push', args: {} })).toBe('caution');
  });

  it('returns safe for git commit', () => {
    expect(assessRisk({ type: 'git_operation', operation: 'commit', args: {} })).toBe('safe');
  });
});
