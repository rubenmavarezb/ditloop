import { Box, Text } from 'ink';
import { useTheme } from '@ditloop/ui';

/** Props for the StatusPanel component. */
export interface StatusPanelProps {
  /** Available width in columns. */
  width: number;
  /** Current branch name. */
  branch?: string;
  /** Current identity name (e.g. "personal"). */
  identity?: string;
  /** Current identity email. */
  email?: string;
  /** Active workspace name. */
  workspace?: string;
  /** Number of errors. */
  errors?: number;
  /** Number of warnings. */
  warnings?: number;
  /** Number of active AIDF tasks. */
  aidfTasks?: number;
  /** Current package name. */
  packageName?: string;
  /** Memory usage in MB. */
  memoryMb?: number;
  /** Current session identifier. */
  sessionId?: string;
}

/**
 * Status bar panel matching the Figma bottom bar design.
 * Single row with segments: NORMAL badge, branch, identity,
 * error/warning counts, AIDF tasks, package, memory, and session ID.
 */
export function StatusPanel({
  width,
  branch,
  identity,
  email,
  errors = 0,
  warnings = 0,
  aidfTasks,
  packageName,
  memoryMb,
  sessionId,
}: StatusPanelProps) {
  const theme = useTheme();

  return (
    <Box width={width} height={1} backgroundColor={theme.panelHeader}>
      {/* NORMAL badge */}
      <Text backgroundColor={theme.active} color="#000000" bold> NORMAL </Text>

      {/* Separator in muted bg */}
      <Text backgroundColor={theme.bgMuted} color={theme.idle}> │ </Text>

      {/* Branch */}
      {branch && (
        <>
          <Text color={theme.active} bold> ⎇ {branch}</Text>
        </>
      )}

      {/* Separator */}
      <Text color={theme.border}> │ </Text>

      {/* Identity */}
      {(identity || email) && (
        <>
          <Text color={theme.textLight}>
            {identity}{email ? ` (${email})` : ''}
          </Text>
          <Text color={theme.border}> │ </Text>
        </>
      )}

      {/* Errors & warnings */}
      <Text color={theme.error}>{errors}E</Text>
      <Text> </Text>
      <Text color={theme.warning}>{warnings}W</Text>

      {/* Separator */}
      <Text color={theme.border}> │ </Text>

      {/* AIDF tasks */}
      {aidfTasks !== undefined && (
        <>
          <Text color={theme.activeLight}>✦ </Text>
          <Text color={theme.activeLight}>AIDF: {aidfTasks} tasks</Text>
          <Text color={theme.border}> │ </Text>
        </>
      )}

      {/* Package name */}
      {packageName && (
        <Text color={theme.idle}>{packageName}</Text>
      )}

      {/* Right-aligned: memory + session */}
      <Box flexGrow={1} />
      {memoryMb !== undefined && (
        <Text color={theme.idle}>MEM: {memoryMb}MB</Text>
      )}
      {sessionId && (
        <>
          <Text>  </Text>
          <Text color={theme.active}>{sessionId}</Text>
        </>
      )}
    </Box>
  );
}
