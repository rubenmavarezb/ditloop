import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Minimal workspace data needed for rendering. */
export interface WorkspaceItemData {
  /** Workspace name. */
  name: string;
  /** Workspace type. */
  type: 'single' | 'group';
  /** Number of sub-projects (for groups). */
  projectCount: number;
  /** Workspace status. */
  status: 'active' | 'idle' | 'warning' | 'error';
  /** Filesystem path to the workspace root. */
  path?: string;
  /** Path to the .ai/ directory, if detected. */
  aidfPath?: string;
}

/** Props for the WorkspaceItem component. */
export interface WorkspaceItemProps {
  /** Workspace data to display. */
  workspace: WorkspaceItemData;
  /** Whether this item is currently selected. */
  isSelected: boolean;
  /** Whether this item is expanded (showing sub-projects). */
  isExpanded: boolean;
}

const statusIcons: Record<string, string> = {
  active: '🟢',
  idle: '⚪',
  warning: '🟡',
  error: '🔴',
};

/**
 * Collapsible workspace entry showing status, name, and project count.
 *
 * @param props - Workspace item configuration
 */
export function WorkspaceItem({ workspace, isSelected, isExpanded }: WorkspaceItemProps) {
  const theme = useTheme();
  const icon = statusIcons[workspace.status] ?? '⚪';
  const expandIcon = workspace.type === 'group' ? (isExpanded ? '▼' : '▶') : ' ';

  return (
    <Box>
      <Text color={isSelected ? theme.accent : undefined}>
        {isSelected ? '❯ ' : '  '}
      </Text>
      <Text>{icon} </Text>
      <Text color={isSelected ? theme.text : theme.textDim}>{expandIcon} </Text>
      <Text bold={isSelected} color={isSelected ? theme.text : theme.textDim}>
        {workspace.name}
      </Text>
      {workspace.type === 'group' && (
        <Text color={theme.textDim}> ({workspace.projectCount})</Text>
      )}
    </Box>
  );
}
