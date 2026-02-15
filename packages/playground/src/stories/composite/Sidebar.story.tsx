import { ThemeProvider, Sidebar } from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'Sidebar',
  category: 'composite',
};

const mockWorkspaces: WorkspaceItemData[] = [
  { name: 'Pivotree', type: 'group', projectCount: 5, status: 'active' },
  { name: 'OnyxOdds', type: 'group', projectCount: 3, status: 'warning' },
  { name: 'Personal', type: 'single', projectCount: 0, status: 'idle' },
  { name: 'DitLoop', type: 'single', projectCount: 0, status: 'active' },
];

export function Default() {
  return (
    <ThemeProvider>
      <Sidebar workspaces={mockWorkspaces} />
    </ThemeProvider>
  );
}
