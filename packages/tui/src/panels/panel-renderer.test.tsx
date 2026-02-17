import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { SidebarPanel } from './sidebar-panel.js';
import { SourceControlPanel } from './source-control-panel.js';
import { StatusPanel } from './status-panel.js';

describe('SidebarPanel', () => {
  it('renders title and tab bar', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SidebarPanel width={40} height={20} />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('DITLOOP');
    expect(output).toContain('WORKSPACES');
  });

  it('renders workspace entries with platform badge', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SidebarPanel
          width={50}
          height={25}
          workspaces={[
            { name: 'ditloop', branch: 'main', email: 'dev@example.com', active: true, platform: 'gh' },
            { name: 'other-project', branch: 'feat/new', active: false, platform: 'bb' },
          ]}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('ditloop');
    expect(output).toContain('other-project');
    expect(output).toContain('main');
    expect(output).toContain('feat/new');
    expect(output).toContain('gh');
    expect(output).toContain('bb');
  });

  it('highlights first workspace by default (selectedIndex=0)', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SidebarPanel
          width={50}
          height={25}
          workspaces={[
            { name: 'alpha', branch: 'main' },
            { name: 'beta', branch: 'develop' },
            { name: 'gamma', branch: 'feat/x' },
          ]}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    // First workspace should have the ">" indicator
    expect(output).toContain('> ');
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    expect(output).toContain('gamma');
  });

  it('renders quick actions and AIDF context with edit button', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SidebarPanel
          width={50}
          height={30}
          aidfContext={{ role: 'developer.md', task: '#054 retry logic', plan: 'v0.8-ide' }}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('QUICK ACTIONS');
    expect(output).toContain('New Project');
    expect(output).toContain('AIDF CONTEXT');
    expect(output).toContain('developer.md');
    expect(output).toContain('Edit Context');
  });
});

describe('SourceControlPanel', () => {
  it('renders branch and sections', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SourceControlPanel
          width={50}
          height={20}
          branch="main"
          ahead={2}
          behind={0}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('SOURCE CONTROL');
    expect(output).toContain('main');
    expect(output).toContain('STAGED');
    expect(output).toContain('CHANGES');
    expect(output).toContain('COMMIT');
  });

  it('renders staged and unstaged files with packages', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SourceControlPanel
          width={60}
          height={25}
          branch="feat/ui"
          staged={[
            { status: 'M', file: 'executor.ts', package: 'core' },
            { status: 'A', file: 'executor.test.ts', package: 'core' },
          ]}
          unstaged={[
            { status: 'M', file: 'loader.ts', package: 'config' },
            { status: 'D', file: 'unused.ts', package: 'config' },
          ]}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('STAGED (2)');
    expect(output).toContain('executor.ts');
    expect(output).toContain('CHANGES (2)');
    expect(output).toContain('loader.ts');
    expect(output).toContain('core');
  });

  it('renders recent commits', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <SourceControlPanel
          width={60}
          height={25}
          branch="main"
          commits={[
            { hash: 'ba67018', message: 'feat(aidf): executor...', time: '2h' },
            { hash: '8680dac', message: 'fix(ci): remove...', time: '3h' },
          ]}
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('RECENT COMMITS');
    expect(output).toContain('ba67018');
    expect(output).toContain('fix(ci): remove');
  });
});

describe('StatusPanel', () => {
  it('renders status bar with all segments', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <StatusPanel
          width={120}
          branch="main*"
          identity="personal"
          email="rubennmavarezb@gmail.com"
          errors={0}
          warnings={2}
          aidfTasks={2}
          packageName="ditloop/core"
          memoryMb={450}
          sessionId="TUI_SESSION_01"
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('NORMAL');
    expect(output).toContain('main');
    expect(output).toContain('personal');
    expect(output).toContain('│');
    expect(output).toContain('0E');
    expect(output).toContain('2W');
    expect(output).toContain('AIDF: 2 tasks');
    expect(output).toContain('MEM: 450MB');
    expect(output).toContain('TUI_SESSION_01');
  });

  it('renders minimal status bar', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <StatusPanel width={60} branch="develop" />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('NORMAL');
    expect(output).toContain('develop');
  });

  it('renders status bar with workspace name and email', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <StatusPanel
          width={120}
          branch="feat/auth"
          workspace="onyxodds"
          identity="onyxodds"
          email="rmavarez@onyxodds.com"
        />
      </ThemeProvider>,
    );
    const output = lastFrame() ?? '';
    expect(output).toContain('feat/auth');
    expect(output).toContain('onyxodds');
  });
});
