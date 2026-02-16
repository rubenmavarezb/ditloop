import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the PreviewPanel component. */
export interface PreviewPanelProps {
  /** Title of the previewed item (file name, commit hash, etc.). */
  title: string;
  /** Lines of content to display. */
  lines: string[];
  /** Scroll offset (number of lines skipped from the top). */
  scrollOffset: number;
  /** Maximum visible lines (determined by panel height). */
  maxLines: number;
}

/**
 * Display a scrollable text preview for files, diffs, or commit details.
 * Shows a title header and the visible slice of content lines.
 *
 * @param props - Preview content and scroll state
 */
export function PreviewPanel({
  title,
  lines,
  scrollOffset,
  maxLines,
}: PreviewPanelProps) {
  const theme = useTheme();

  if (lines.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.accent} bold>{title}</Text>
        <Text color={theme.textDim}>No content</Text>
      </Box>
    );
  }

  const visible = lines.slice(scrollOffset, scrollOffset + maxLines);
  const hasMore = scrollOffset + maxLines < lines.length;

  return (
    <Box flexDirection="column">
      <Text color={theme.accent} bold>{title}</Text>
      {visible.map((line, i) => (
        <Text key={`${scrollOffset + i}`} color={theme.text}>
          {line}
        </Text>
      ))}
      {hasMore && (
        <Text color={theme.textDim}>... ({lines.length - scrollOffset - maxLines} more lines)</Text>
      )}
    </Box>
  );
}
