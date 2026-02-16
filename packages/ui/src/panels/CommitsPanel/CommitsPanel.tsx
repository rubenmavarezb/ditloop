import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A commit entry for display. */
export interface PanelCommitEntry {
  /** Abbreviated hash. */
  shortHash: string;
  /** Author name. */
  author: string;
  /** Relative time string (e.g., '2h ago'). */
  relativeTime: string;
  /** Commit subject line. */
  subject: string;
  /** Whether this is the HEAD commit. */
  isHead: boolean;
  /** Ref names (tags, branches). */
  refs: string[];
}

/** Props for the CommitsPanel component. */
export interface CommitsPanelProps {
  /** Array of commits, newest first. */
  commits: PanelCommitEntry[];
  /** Currently selected commit index. */
  selectedIndex: number;
  /** Called when a commit is highlighted. */
  onCommitSelect?: (hash: string) => void;
}

/**
 * Display recent commits with hash, author, time, and message.
 * HEAD commit is highlighted with accent color.
 *
 * @param props - Commit data and callbacks
 */
export function CommitsPanel({
  commits,
  selectedIndex,
}: CommitsPanelProps) {
  const theme = useTheme();

  if (commits.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>No commits</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {commits.map((c, i) => {
        const selected = i === selectedIndex;
        const hashColor = c.isHead ? theme.accent : theme.warning;
        const textColor = selected ? theme.accent : theme.text;
        const refBadges = c.refs.length > 0 ? ` (${c.refs.join(', ')})` : '';

        return (
          <Box key={`${c.shortHash}-${i}`} gap={1}>
            <Text color={selected ? theme.accent : hashColor}>{c.shortHash}</Text>
            <Text color={theme.textDim}>{c.author}</Text>
            <Text color={theme.textDim}>{c.relativeTime}</Text>
            <Text color={textColor}>
              {c.subject}
              {refBadges && <Text color={theme.active}>{refBadges}</Text>}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
