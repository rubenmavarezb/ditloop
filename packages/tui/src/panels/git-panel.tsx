import { Box, Text } from 'ink';

/** Props for the GitPanel component. */
export interface GitPanelProps {
  /** Available width in columns. */
  width: number;
  /** Available height in rows. */
  height: number;
  /** Current branch name. */
  branch?: string;
  /** Number of staged files. */
  staged?: number;
  /** Number of unstaged modified files. */
  unstaged?: number;
  /** Number of untracked files. */
  untracked?: number;
  /** Last commit message. */
  lastCommit?: string;
}

/**
 * Git status panel optimized for narrow tmux panes.
 */
export function GitPanel({ width, height, branch, staged = 0, unstaged = 0, untracked = 0, lastCommit }: GitPanelProps) {
  return (
    <Box flexDirection="column" width={width} height={height}>
      <Text bold>Git Status</Text>
      {branch && <Text color="cyan">{branch}</Text>}
      <Text color="green">Staged: {staged}</Text>
      <Text color="yellow">Modified: {unstaged}</Text>
      <Text color="red">Untracked: {untracked}</Text>
      {lastCommit && <Text color="gray">{lastCommit.slice(0, width - 2)}</Text>}
    </Box>
  );
}
