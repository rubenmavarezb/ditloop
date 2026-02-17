import { Box, Text } from 'ink';

/** Props for the SidebarPanel component. */
export interface SidebarPanelProps {
  /** Available width in columns. */
  width: number;
  /** Available height in rows. */
  height: number;
  /** Workspace entries to display. */
  workspaces?: Array<{ name: string; branch?: string; active?: boolean }>;
  /** Callback when a workspace is selected. */
  onWorkspaceSelect?: (path: string) => void;
}

/**
 * Sidebar panel optimized for narrow tmux panes. Shows workspace list.
 */
export function SidebarPanel({ width, height, workspaces = [] }: SidebarPanelProps) {
  const maxName = Math.max(8, width - 6);
  return (
    <Box flexDirection="column" width={width} height={height}>
      <Text bold>Workspaces</Text>
      {workspaces.slice(0, height - 1).map((ws, i) => (
        <Box key={ws.name}>
          <Text color={ws.active ? 'green' : undefined}>
            {ws.active ? '> ' : '  '}
            {String(i + 1).padStart(2)}
            {' '}
            {ws.name.slice(0, maxName)}
            {ws.branch ? ` [${ws.branch.slice(0, 10)}]` : ''}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
