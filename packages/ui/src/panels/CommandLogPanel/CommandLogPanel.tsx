import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A command log entry. */
export interface CommandLogEntry {
  /** Timestamp string (e.g., '12:34:56'). */
  time: string;
  /** The command that was executed. */
  command: string;
  /** Exit code (0 = success). */
  exitCode: number;
  /** Duration in milliseconds. */
  durationMs: number;
}

/** Props for the CommandLogPanel component. */
export interface CommandLogPanelProps {
  /** Array of recent command executions, newest first. */
  entries: CommandLogEntry[];
  /** Maximum entries to display. */
  maxEntries: number;
}

/**
 * Display a log of recent command executions with status and timing.
 * Used as the bottom bar panel showing git operations and task runs.
 *
 * @param props - Command log data
 */
export function CommandLogPanel({
  entries,
  maxEntries,
}: CommandLogPanelProps) {
  const theme = useTheme();

  if (entries.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>No commands executed</Text>
      </Box>
    );
  }

  const visible = entries.slice(0, maxEntries);

  return (
    <Box flexDirection="column">
      {visible.map((entry, i) => {
        const statusColor = entry.exitCode === 0 ? theme.active : theme.error;
        const statusIcon = entry.exitCode === 0 ? '✓' : '✗';
        const duration = entry.durationMs < 1000
          ? `${entry.durationMs}ms`
          : `${(entry.durationMs / 1000).toFixed(1)}s`;

        return (
          <Box key={`${entry.time}-${i}`} gap={1}>
            <Text color={theme.textDim}>{entry.time}</Text>
            <Text color={statusColor}>{statusIcon}</Text>
            <Text color={theme.text}>{entry.command}</Text>
            <Text color={theme.textDim}>{duration}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
