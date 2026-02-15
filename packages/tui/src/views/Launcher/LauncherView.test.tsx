import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { LauncherView } from './LauncherView.js';
import type { DetectedCli, AidfTask } from '@ditloop/core';

const mockDetectedCli: DetectedCli = {
  definition: {
    name: 'Claude Code',
    binary: 'claude',
    versionFlag: '--version',
    contextInjection: { type: 'flag', flag: '--system-prompt' },
    installUrl: 'https://docs.anthropic.com',
  },
  binaryPath: '/usr/local/bin/claude',
  version: '1.0.0',
  available: true,
};

const mockTask: AidfTask = {
  id: '029-context-builder',
  title: 'Context Builder',
  status: 'in-progress',
  goal: 'Build context',
  scope: 'core',
  requirements: 'Must work',
  dod: 'Tests pass',
  frontmatter: {},
  filePath: '/test/.ai/tasks/029-context-builder.md',
};

const defaultProps = {
  detectedClis: [mockDetectedCli],
  allCliIds: ['claude', 'aider'],
  cliDefinitions: new Map([
    ['claude', { name: 'Claude Code', installUrl: 'https://docs.anthropic.com' }],
    ['aider', { name: 'Aider', installUrl: 'https://aider.chat' }],
  ]),
  tasks: [mockTask],
  workspaceName: 'test-workspace',
  currentBranch: 'feat/test',
  onLaunch: vi.fn(),
  onBack: vi.fn(),
};

describe('LauncherView', () => {
  it('renders AI Launcher title', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <LauncherView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('AI Launcher');
  });

  it('renders detected CLIs with version', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <LauncherView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Claude Code');
    expect(lastFrame()).toContain('v1.0.0');
  });

  it('shows unavailable CLIs', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <LauncherView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Aider');
    expect(lastFrame()).toContain('not installed');
  });

  it('renders context preview with workspace info', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <LauncherView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('test-workspace');
    expect(lastFrame()).toContain('feat/test');
  });

  it('renders keyboard shortcuts', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <LauncherView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('navigate');
    expect(lastFrame()).toContain('select/launch');
    expect(lastFrame()).toContain('back');
  });
});
