import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { WorkspacePanelsView } from './WorkspacePanelsView.js';
import { useKeyboardStore } from '../../state/keyboard-store.js';
import { useLayoutStore } from '../../state/layout-store.js';
import { DEFAULT_WORKSPACE_LAYOUT } from '@ditloop/ui';

function renderWithTheme(el: React.ReactElement) {
  return render(<ThemeProvider>{el}</ThemeProvider>);
}

describe('WorkspacePanelsView', () => {
  beforeEach(() => {
    useKeyboardStore.setState({
      mode: 'normal',
      focusedPanelId: 'git-status',
      panelOrder: ['git-status', 'commits', 'file-tree', 'tasks', 'preview', 'branches'],
      bindings: [],
      helpVisible: false,
    });
    useLayoutStore.setState({
      layoutConfig: DEFAULT_WORKSPACE_LAYOUT,
      isDirty: false,
    });
  });

  it('renders without crashing', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspacePanelsView
        repoPath={null}
        aidfPath={null}
        termWidth={120}
        termHeight={40}
      />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it('shows panel titles', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspacePanelsView
        repoPath="/tmp/repo"
        aidfPath="/tmp/repo/.ai"
        termWidth={200}
        termHeight={50}
      />,
    );
    const frame = lastFrame() ?? '';
    expect(frame).toContain('Git Status');
    expect(frame).toContain('Commits');
    expect(frame).toContain('Branches');
    expect(frame).toContain('Preview');
    expect(frame).toContain('File Tree');
    // Tasks panel may be narrow; check for partial label
    expect(frame).toContain('ask');
  });

  it('shows shortcuts bar with expected keys', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspacePanelsView
        repoPath={null}
        aidfPath={null}
        termWidth={120}
        termHeight={40}
      />,
    );
    const frame = lastFrame() ?? '';
    expect(frame).toContain('Tab');
    expect(frame).toContain('j/k');
    expect(frame).toContain('h/l');
    expect(frame).toContain('+/-');
    expect(frame).toContain('Help');
  });

  it('renders with mock data when paths are provided', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspacePanelsView
        repoPath="/tmp/repo"
        aidfPath="/tmp/repo/.ai"
        termWidth={120}
        termHeight={40}
      />,
    );
    const frame = lastFrame() ?? '';
    // Mock data should populate panels
    expect(frame.length).toBeGreaterThan(100);
  });
});
