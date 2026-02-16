import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A branch entry for display. */
export interface PanelBranchEntry {
  /** Branch name. */
  name: string;
  /** Whether this is the current branch. */
  isCurrent: boolean;
  /** Ahead/behind tracking info. */
  ahead: number;
  behind: number;
  /** Whether this is a remote branch. */
  isRemote: boolean;
  /** Worktree path if this branch is checked out in a worktree. */
  worktreePath?: string;
}

/** Props for the BranchesPanel component. */
export interface BranchesPanelProps {
  /** Local branches. */
  local: PanelBranchEntry[];
  /** Remote branches. */
  remote: PanelBranchEntry[];
  /** Currently selected branch index. */
  selectedIndex: number;
  /** Called when a branch is highlighted. */
  onBranchSelect?: (branch: string) => void;
}

/**
 * Display local and remote branches with current branch indicator,
 * ahead/behind tracking, and worktree associations.
 *
 * @param props - Branch data and callbacks
 */
export function BranchesPanel({
  local,
  remote,
  selectedIndex,
}: BranchesPanelProps) {
  const theme = useTheme();

  let globalIndex = 0;

  return (
    <Box flexDirection="column">
      <Text color={theme.text} bold>Local ({local.length})</Text>
      {local.map((b) => {
        const idx = globalIndex++;
        const selected = idx === selectedIndex;
        const prefix = b.isCurrent ? '* ' : '  ';
        const color = selected ? theme.accent : b.isCurrent ? theme.active : theme.text;
        const tracking = (b.ahead || b.behind)
          ? ` +${b.ahead} -${b.behind}`
          : '';
        const wt = b.worktreePath ? ` [wt: ${b.worktreePath}]` : '';

        return (
          <Text key={`l-${b.name}`} color={color}>
            {selected ? '>' : ' '}{prefix}{b.name}
            {tracking && <Text color={theme.textDim}>{tracking}</Text>}
            {wt && <Text color={theme.textDim}>{wt}</Text>}
          </Text>
        );
      })}
      {remote.length > 0 && (
        <>
          <Text color={theme.textDim} bold>Remote ({remote.length})</Text>
          {remote.map((b) => {
            const idx = globalIndex++;
            const selected = idx === selectedIndex;
            return (
              <Text key={`r-${b.name}`} color={selected ? theme.accent : theme.textDim}>
                {selected ? '>' : ' '}  {b.name}
              </Text>
            );
          })}
        </>
      )}
    </Box>
  );
}
