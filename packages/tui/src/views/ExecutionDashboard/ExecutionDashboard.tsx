import { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

/** Status of an execution entry. */
type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Execution row data for display. */
export interface ExecutionRow {
  id: string;
  workspace: string;
  status: ExecutionStatus;
  startTime: number;
  duration?: number;
  exitCode?: number;
}

/** Props for the ExecutionDashboard component. */
export interface ExecutionDashboardProps {
  /** Execution rows to display. */
  executions: ExecutionRow[];
  /** Whether the server is connected. */
  serverConnected: boolean;
  /** Callback when user presses cancel on a selected execution. */
  onCancel?: (id: string) => void;
  /** Callback when user presses retry on a selected execution. */
  onRetry?: (id: string) => void;
  /** Callback when user presses back/quit. */
  onBack?: () => void;
}

/** Status color mapping. */
function getStatusColor(status: ExecutionStatus): string {
  switch (status) {
    case 'running': return 'cyan';
    case 'completed': return 'green';
    case 'failed': return 'red';
    case 'queued': return 'yellow';
    case 'cancelled': return 'gray';
  }
}

/** Status icon mapping. */
function getStatusIcon(status: ExecutionStatus): string {
  switch (status) {
    case 'running': return '⟳';
    case 'completed': return '✓';
    case 'failed': return '✗';
    case 'queued': return '◌';
    case 'cancelled': return '⊘';
  }
}

/** Format duration in seconds. */
function formatDuration(ms?: number): string {
  if (ms === undefined) return '—';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m${remainingSeconds}s`;
}

/** Format timestamp to relative time. */
function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/**
 * TUI dashboard view showing table of all executions with real-time updates
 * and interactive controls.
 */
export function ExecutionDashboard({
  executions,
  serverConnected,
  onCancel,
  onRetry,
  onBack,
}: ExecutionDashboardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ExecutionStatus | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'duration' | 'status'>('time');

  // Filter
  const filtered = filterStatus
    ? executions.filter((e) => e.status === filterStatus)
    : executions;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'time': return b.startTime - a.startTime;
      case 'duration': return (b.duration ?? 0) - (a.duration ?? 0);
      case 'status': return a.status.localeCompare(b.status);
    }
  });

  // Clamp selection
  useEffect(() => {
    if (selectedIndex >= sorted.length && sorted.length > 0) {
      setSelectedIndex(sorted.length - 1);
    }
  }, [sorted.length, selectedIndex]);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => Math.min(sorted.length - 1, i + 1));
    } else if (input === 'c' && sorted[selectedIndex]) {
      onCancel?.(sorted[selectedIndex].id);
    } else if (input === 'r' && sorted[selectedIndex]) {
      onRetry?.(sorted[selectedIndex].id);
    } else if (input === 'f') {
      // Cycle filter: null -> running -> completed -> failed -> queued -> null
      const cycle: (ExecutionStatus | null)[] = [null, 'running', 'completed', 'failed', 'queued', 'cancelled'];
      const currentIdx = cycle.indexOf(filterStatus);
      setFilterStatus(cycle[(currentIdx + 1) % cycle.length]);
    } else if (input === 's') {
      // Cycle sort
      const sortCycle: ('time' | 'duration' | 'status')[] = ['time', 'duration', 'status'];
      const currentIdx = sortCycle.indexOf(sortBy);
      setSortBy(sortCycle[(currentIdx + 1) % sortCycle.length]);
    } else if (input === 'q' || key.escape) {
      onBack?.();
    }
  });

  const COL_ID = 8;
  const COL_WS = 20;
  const COL_STATUS = 12;
  const COL_STARTED = 10;
  const COL_DURATION = 10;
  const COL_EXIT = 6;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold>Executions</Text>
        <Box>
          <Text color={serverConnected ? 'green' : 'red'}>
            {serverConnected ? '● Connected' : '○ Disconnected'}
          </Text>
          {filterStatus && (
            <Text color="yellow"> Filter: {filterStatus}</Text>
          )}
          <Text color="gray"> Sort: {sortBy}</Text>
        </Box>
      </Box>

      {/* Table header */}
      <Box>
        <Text bold color="gray">
          {'  '}
          {'ID'.padEnd(COL_ID)}
          {'Workspace'.padEnd(COL_WS)}
          {'Status'.padEnd(COL_STATUS)}
          {'Started'.padEnd(COL_STARTED)}
          {'Duration'.padEnd(COL_DURATION)}
          {'Exit'.padEnd(COL_EXIT)}
        </Text>
      </Box>

      {/* Rows */}
      {sorted.length === 0 ? (
        <Box marginTop={1}>
          <Text color="gray">No executions{filterStatus ? ` with status "${filterStatus}"` : ''}</Text>
        </Box>
      ) : (
        sorted.map((exec, idx) => {
          const isSelected = idx === selectedIndex;
          const statusColor = getStatusColor(exec.status);
          const icon = getStatusIcon(exec.status);

          return (
            <Box key={exec.id}>
              <Text inverse={isSelected}>
                {isSelected ? '▸ ' : '  '}
                {exec.id.slice(0, COL_ID - 1).padEnd(COL_ID)}
                {exec.workspace.slice(0, COL_WS - 1).padEnd(COL_WS)}
              </Text>
              <Text inverse={isSelected} color={statusColor}>
                {`${icon} ${exec.status}`.padEnd(COL_STATUS)}
              </Text>
              <Text inverse={isSelected}>
                {formatTime(exec.startTime).padEnd(COL_STARTED)}
                {formatDuration(exec.duration).padEnd(COL_DURATION)}
                {(exec.exitCode !== undefined ? String(exec.exitCode) : '—').padEnd(COL_EXIT)}
              </Text>
            </Box>
          );
        })
      )}

      {/* Shortcuts */}
      <Box marginTop={1}>
        <Text color="gray">
          ↑↓ navigate  c cancel  r retry  f filter  s sort  q back
        </Text>
      </Box>
    </Box>
  );
}
