import { Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the RelativeTime component. */
export interface RelativeTimeProps {
  /** The date to display relative to now. */
  date: Date;
}

/**
 * Format a date as a short relative time string.
 *
 * @param date - Date to format
 * @returns Short relative string like "now", "5m", "2h", "3d", "2w"
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return `${diffWeek}w`;
}

/**
 * Renders a relative time string from a Date input.
 * Displays compact format: "now", "12m", "1d", "3w".
 *
 * @param props - Component props with date
 */
export function RelativeTime({ date }: RelativeTimeProps) {
  const theme = useTheme();
  return <Text color={theme.textDim}>{formatRelativeTime(date)}</Text>;
}
