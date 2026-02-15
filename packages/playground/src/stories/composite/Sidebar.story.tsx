import { ThemeProvider, Sidebar } from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';

const mockWorkspaces: WorkspaceItemData[] = [
  { name: 'Pivotree', type: 'group', projectCount: 5, status: 'active' },
  { name: 'OnyxOdds', type: 'group', projectCount: 3, status: 'warning' },
  { name: 'Personal', type: 'single', projectCount: 0, status: 'idle' },
  { name: 'DitLoop', type: 'single', projectCount: 0, status: 'active' },
];

export function SidebarStory() {
  return (
    <ThemeProvider>
      <Sidebar workspaces={mockWorkspaces} />
    </ThemeProvider>
  );
}
