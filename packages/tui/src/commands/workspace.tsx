import { Box, Text } from 'ink';
import { ThemeProvider, useTheme, StatusBadge, Panel } from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';

/** Props for the WorkspaceList command. */
export interface WorkspaceListProps {
  /** Workspaces to display. */
  workspaces: WorkspaceItemData[];
}

/**
 * CLI command that prints a table of configured workspaces.
 */
export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <ThemeProvider>
      <WorkspaceListInner workspaces={workspaces} />
    </ThemeProvider>
  );
}

function WorkspaceListInner({ workspaces }: WorkspaceListProps) {
  const theme = useTheme();

  if (workspaces.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>No workspaces configured.</Text>
        <Text color={theme.textDim}>Run `ditloop init` to get started.</Text>
      </Box>
    );
  }

  return (
    <Panel title="Workspaces" badge={String(workspaces.length)}>
      <Box flexDirection="column">
        {workspaces.map((ws, i) => (
          <Box key={i} gap={2}>
            <StatusBadge variant={ws.status} label={ws.name} />
            <Text color={theme.textDim}>
              {ws.type}{ws.type === 'group' ? ` (${ws.projectCount} projects)` : ''}
            </Text>
          </Box>
        ))}
      </Box>
    </Panel>
  );
}
