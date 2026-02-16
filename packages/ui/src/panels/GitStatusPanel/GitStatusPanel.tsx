import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A file entry with status indicator. */
export interface StatusFileEntry {
  /** Relative file path. */
  path: string;
  /** Status code (M/A/D/R/?). */
  status: string;
}

/** Props for the GitStatusPanel component. */
export interface GitStatusPanelProps {
  /** Staged files. */
  staged: StatusFileEntry[];
  /** Unstaged modified files. */
  unstaged: StatusFileEntry[];
  /** Untracked file paths. */
  untracked: string[];
  /** Currently selected file index (across all sections). */
  selectedIndex: number;
  /** Called when a file is highlighted. */
  onFileSelect?: (path: string) => void;
}

/**
 * Display git status with staged, unstaged, and untracked sections.
 * Styled like LazyGit's status panel with color-coded sections.
 *
 * @param props - Git status data and callbacks
 */
export function GitStatusPanel({
  staged,
  unstaged,
  untracked,
  selectedIndex,
}: GitStatusPanelProps) {
  const theme = useTheme();

  if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>Clean working tree</Text>
      </Box>
    );
  }

  let globalIndex = 0;

  return (
    <Box flexDirection="column">
      {staged.length > 0 && (
        <>
          <Text color={theme.active} bold>
            Staged ({staged.length})
          </Text>
          {staged.map((f) => {
            const idx = globalIndex++;
            const selected = idx === selectedIndex;
            return (
              <Text key={`s-${f.path}`} color={selected ? theme.accent : theme.active}>
                {selected ? '>' : ' '} {f.status} {f.path}
              </Text>
            );
          })}
        </>
      )}
      {unstaged.length > 0 && (
        <>
          <Text color={theme.warning} bold>
            Unstaged ({unstaged.length})
          </Text>
          {unstaged.map((f) => {
            const idx = globalIndex++;
            const selected = idx === selectedIndex;
            return (
              <Text key={`u-${f.path}`} color={selected ? theme.accent : theme.warning}>
                {selected ? '>' : ' '} {f.status} {f.path}
              </Text>
            );
          })}
        </>
      )}
      {untracked.length > 0 && (
        <>
          <Text color={theme.textDim} bold>
            Untracked ({untracked.length})
          </Text>
          {untracked.map((path) => {
            const idx = globalIndex++;
            const selected = idx === selectedIndex;
            return (
              <Text key={`t-${path}`} color={selected ? theme.accent : theme.textDim}>
                {selected ? '>' : ' '} ? {path}
              </Text>
            );
          })}
        </>
      )}
    </Box>
  );
}
