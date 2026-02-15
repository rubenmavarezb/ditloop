import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Sidebar } from './Sidebar.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import type { WorkspaceItemData } from '../WorkspaceItem/WorkspaceItem.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockWorkspaces: WorkspaceItemData[] = [
  { name: 'Pivotree', type: 'group', projectCount: 3, status: 'active' },
  { name: 'Personal', type: 'single', projectCount: 0, status: 'idle' },
  { name: 'OnyxOdds', type: 'group', projectCount: 2, status: 'warning' },
];

describe('Sidebar', () => {
  it('renders all workspace names', () => {
    const { lastFrame } = renderWithTheme(
      <Sidebar workspaces={mockWorkspaces} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Pivotree');
    expect(frame).toContain('Personal');
    expect(frame).toContain('OnyxOdds');
  });

  it('shows workspace count in panel badge', () => {
    const { lastFrame } = renderWithTheme(
      <Sidebar workspaces={mockWorkspaces} />
    );
    expect(lastFrame()).toContain('[3]');
  });

  it('shows empty message when no workspaces', () => {
    const { lastFrame } = renderWithTheme(
      <Sidebar workspaces={[]} />
    );
    expect(lastFrame()).toContain('No workspaces configured');
  });

  it('hides when visible is false', () => {
    const { lastFrame } = renderWithTheme(
      <Sidebar workspaces={mockWorkspaces} visible={false} />
    );
    expect(lastFrame()).toBe('');
  });

  it('renders the panel title', () => {
    const { lastFrame } = renderWithTheme(
      <Sidebar workspaces={mockWorkspaces} />
    );
    expect(lastFrame()).toContain('Workspaces');
  });
});
