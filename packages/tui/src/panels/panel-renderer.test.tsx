import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { SidebarPanel } from './sidebar-panel.js';
import { GitPanel } from './git-panel.js';
import { StatusPanel } from './status-panel.js';

describe('SidebarPanel', () => {
  it('renders workspace list', () => {
    const { lastFrame } = render(
      <SidebarPanel
        width={30}
        height={10}
        workspaces={[
          { name: 'ditloop', branch: 'main', active: true },
          { name: 'other', branch: 'dev', active: false },
        ]}
      />,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('Workspaces');
    expect(output).toContain('ditloop');
    expect(output).toContain('>');
  });
});

describe('GitPanel', () => {
  it('renders git status', () => {
    const { lastFrame } = render(
      <GitPanel width={30} height={10} branch="main" staged={2} unstaged={1} untracked={3} />,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('main');
    expect(output).toContain('Staged: 2');
  });
});

describe('StatusPanel', () => {
  it('renders status bar', () => {
    const { lastFrame } = render(
      <StatusPanel width={60} branch="main" identity="test@example.com" workspace="ditloop" />,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('main');
    expect(output).toContain('test@example.com');
  });
});
