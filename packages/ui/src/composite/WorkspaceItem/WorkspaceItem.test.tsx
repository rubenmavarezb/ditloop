import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { WorkspaceItem } from './WorkspaceItem.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import type { WorkspaceItemData } from './WorkspaceItem.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockWorkspace: WorkspaceItemData = {
  name: 'Pivotree',
  type: 'group',
  projectCount: 5,
  status: 'active',
};

describe('WorkspaceItem', () => {
  it('renders workspace name', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspaceItem workspace={mockWorkspace} isSelected={false} isExpanded={false} />
    );
    expect(lastFrame()).toContain('Pivotree');
  });

  it('shows project count for group workspaces', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspaceItem workspace={mockWorkspace} isSelected={false} isExpanded={false} />
    );
    expect(lastFrame()).toContain('(5)');
  });

  it('shows selection indicator when selected', () => {
    const { lastFrame } = renderWithTheme(
      <WorkspaceItem workspace={mockWorkspace} isSelected={true} isExpanded={false} />
    );
    expect(lastFrame()).toContain('❯');
  });

  it('shows expand arrow for groups', () => {
    const { lastFrame: collapsed } = renderWithTheme(
      <WorkspaceItem workspace={mockWorkspace} isSelected={false} isExpanded={false} />
    );
    expect(collapsed()).toContain('▶');

    const { lastFrame: expanded } = renderWithTheme(
      <WorkspaceItem workspace={mockWorkspace} isSelected={false} isExpanded={true} />
    );
    expect(expanded()).toContain('▼');
  });

  it('does not show project count for single workspaces', () => {
    const single: WorkspaceItemData = { ...mockWorkspace, type: 'single', projectCount: 0 };
    const { lastFrame } = renderWithTheme(
      <WorkspaceItem workspace={single} isSelected={false} isExpanded={false} />
    );
    expect(lastFrame()).not.toContain('(0)');
  });
});
