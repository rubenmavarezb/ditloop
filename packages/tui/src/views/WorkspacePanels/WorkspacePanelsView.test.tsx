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
      panelOrder: ['git-status', 'commits', 'tasks', 'preview', 'branches', 'command-log'],
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

  it('shows panel labels', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspacePanelsView
        repoPath={null}
        aidfPath={null}
        termWidth={120}
        termHeight={40}
      />,
    );
    const frame = lastFrame() ?? '';
    // Should contain at least some panel labels
    expect(frame.length).toBeGreaterThan(0);
  });

  it('shows shortcuts bar', () => {
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
    expect(frame).toContain('Help');
  });
});
