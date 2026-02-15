import { Box } from 'ink';
import { ThemeProvider, WorkspaceItem } from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'WorkspaceItem',
  category: 'composite',
};

const workspaces: WorkspaceItemData[] = [
  { name: 'Pivotree', type: 'group', projectCount: 5, status: 'active' },
  { name: 'OnyxOdds', type: 'group', projectCount: 3, status: 'warning' },
  { name: 'DitLoop', type: 'single', projectCount: 0, status: 'active' },
  { name: 'Legacy App', type: 'single', projectCount: 0, status: 'error' },
  { name: 'Sandbox', type: 'single', projectCount: 0, status: 'idle' },
];

export function Default() {
  return (
    <ThemeProvider>
      <Box flexDirection="column">
        {workspaces.map((ws, i) => (
          <WorkspaceItem
            key={i}
            workspace={ws}
            isSelected={i === 0}
            isExpanded={i === 0}
          />
        ))}
      </Box>
    </ThemeProvider>
  );
}

export function GroupExpanded() {
  return (
    <ThemeProvider>
      <WorkspaceItem
        workspace={workspaces[0]}
        isSelected
        isExpanded
      />
    </ThemeProvider>
  );
}
