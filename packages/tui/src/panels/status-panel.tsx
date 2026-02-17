import { Box, Text } from 'ink';

/** Props for the StatusPanel component. */
export interface StatusPanelProps {
  /** Available width in columns. */
  width: number;
  /** Current branch name. */
  branch?: string;
  /** Current identity email. */
  identity?: string;
  /** Active workspace name. */
  workspace?: string;
}

/**
 * Single-row status bar panel for the bottom tmux pane.
 */
export function StatusPanel({ width, branch, identity, workspace }: StatusPanelProps) {
  const parts: string[] = [];
  if (branch) parts.push(`\u23C7 ${branch}`);
  if (identity) parts.push(identity);
  if (workspace) parts.push(workspace);
  const text = parts.join(' \u2502 ').slice(0, width);
  return (
    <Box width={width} height={1}>
      <Text inverse>{text.padEnd(width)}</Text>
    </Box>
  );
}
