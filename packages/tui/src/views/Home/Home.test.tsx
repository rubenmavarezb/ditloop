import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'ink-testing-library';
import { Home } from './Home.js';
import { ThemeProvider } from '@ditloop/ui';
import { useAppStore } from '../../state/app-store.js';

describe('Home', () => {
  beforeEach(() => {
    useAppStore.setState({
      workspaces: [],
      activeWorkspaceIndex: null,
      currentProfile: null,
      currentView: 'home',
      initialized: true,
      sidebarVisible: true,
    });
  });

  it('renders the logo', () => {
    const { lastFrame } = render(
      <ThemeProvider><Home /></ThemeProvider>
    );
    expect(lastFrame()).toContain('ditloop');
  });

  it('shows workspace count', () => {
    useAppStore.setState({
      workspaces: [
        { name: 'A', type: 'single', projectCount: 0, status: 'active' },
        { name: 'B', type: 'single', projectCount: 0, status: 'idle' },
      ],
    });
    const { lastFrame } = render(
      <ThemeProvider><Home /></ThemeProvider>
    );
    expect(lastFrame()).toContain('2');
  });

  it('shows profile when set', () => {
    useAppStore.setState({ currentProfile: 'pivotree' });
    const { lastFrame } = render(
      <ThemeProvider><Home /></ThemeProvider>
    );
    expect(lastFrame()).toContain('pivotree');
  });
});
