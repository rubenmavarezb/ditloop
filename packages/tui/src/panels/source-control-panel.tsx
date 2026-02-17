import { Box, Text } from 'ink';
import { useTheme } from '@ditloop/ui';

/** A file entry in staged or unstaged changes. */
export interface SourceControlFileEntry {
  /** Git status indicator (M, A, D, ?, R). */
  status: string;
  /** File path. */
  file: string;
  /** Package name if in a monorepo. */
  package?: string;
}

/** A recent commit entry. */
export interface SourceControlCommitEntry {
  /** Short commit hash. */
  hash: string;
  /** Commit message. */
  message: string;
  /** Relative time (e.g. "2h"). */
  time: string;
}

/** Props for the SourceControlPanel component. */
export interface SourceControlPanelProps {
  /** Available width in columns. */
  width: number;
  /** Available height in rows. */
  height: number;
  /** Current branch name. */
  branch?: string;
  /** Commits ahead of remote. */
  ahead?: number;
  /** Commits behind remote. */
  behind?: number;
  /** Current commit message draft. */
  commitMessage?: string;
  /** Staged files. */
  staged?: SourceControlFileEntry[];
  /** Unstaged/changed files. */
  unstaged?: SourceControlFileEntry[];
  /** Recent commits. */
  commits?: SourceControlCommitEntry[];
}

/**
 * Build a section divider: ─── LABEL ────────────
 */
function sectionDivider(label: string, totalWidth: number): string {
  const padded = ` ${label} `;
  const remaining = Math.max(0, totalWidth - padded.length);
  const left = Math.min(3, remaining);
  const right = remaining - left;
  return `${'─'.repeat(left)}${padded}${'─'.repeat(right)}`;
}

/**
 * Returns a color for a staged file status indicator (green tones).
 */
function stagedStatusColor(status: string, theme: ReturnType<typeof useTheme>): string {
  switch (status) {
    case 'M': return theme.active;
    case 'A': return theme.active;
    case 'D': return theme.error;
    case 'R': return theme.active;
    default: return theme.textDim;
  }
}

/**
 * Returns a color for an unstaged file status indicator.
 */
function unstagedStatusColor(status: string, theme: ReturnType<typeof useTheme>): string {
  switch (status) {
    case 'M': return theme.warning;
    case 'D': return theme.error;
    case '?': return theme.error;
    default: return theme.textDim;
  }
}

/**
 * Source control panel matching the Figma right pane design. Shows branch info,
 * commit input, staged/unstaged files, and recent commits with box-drawing borders.
 */
export function SourceControlPanel({
  width,
  height,
  branch,
  ahead = 0,
  behind = 0,
  commitMessage,
  staged = [],
  unstaged = [],
  commits = [],
}: SourceControlPanelProps) {
  const theme = useTheme();
  const innerWidth = Math.max(4, width - 4);

  const headerLabel = '─ SOURCE CONTROL ── [Ctrl+Shift+G] ';
  const headerPad = Math.max(0, innerWidth - headerLabel.length);
  const topBorder = `┌${headerLabel}${'─'.repeat(headerPad)}┐`;
  const bottomBorder = `└${'─'.repeat(innerWidth + 2)}┘`;

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Title border */}
      <Text color={theme.border}>{topBorder}</Text>

      <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
        {/* Branch row */}
        <Box>
          <Text color={theme.active} bold>⎇ {branch ?? 'no branch'}</Text>
          <Text>  </Text>
          <Text color={theme.textDim}>↑{ahead} ↓{behind}</Text>
        </Box>

        {/* Commit message placeholder */}
        <Box marginTop={1}>
          <Text color={theme.textDim}>Commit message...</Text>
        </Box>

        {/* Commit message input field */}
        <Box
          borderStyle="round"
          borderColor={theme.bgMuted}
        >
          <Text color={commitMessage ? theme.textDim : theme.textDim}>
            {commitMessage || '                              '}
          </Text>
        </Box>

        {/* Commit button — centered */}
        <Box justifyContent="center">
          <Text backgroundColor={theme.active} color="#000000" bold> [CTRL+ENTER] COMMIT </Text>
        </Box>

        {/* Staged files */}
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text color={theme.textDim}>{sectionDivider(`STAGED (${staged.length})`, innerWidth - 5)}</Text>
            <Box flexGrow={1} />
            <Text color={theme.active}>[-]</Text>
          </Box>
          {staged.map((f) => (
            <Box key={f.file}>
              <Text color={stagedStatusColor(f.status, theme)} bold>{f.status}</Text>
              <Text> </Text>
              <Text color={theme.text}>{f.file}</Text>
              <Box flexGrow={1} />
              {f.package && <Text color={theme.textDim}>{f.package}</Text>}
            </Box>
          ))}
          {staged.length === 0 && (
            <Text color={theme.textDim}>  No staged changes</Text>
          )}
        </Box>

        {/* Unstaged changes */}
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text color={theme.textDim}>{sectionDivider(`CHANGES (${unstaged.length})`, innerWidth - 5)}</Text>
            <Box flexGrow={1} />
            <Text color={theme.active}>[+]</Text>
          </Box>
          {unstaged.map((f) => (
            <Box key={f.file}>
              <Text color={unstagedStatusColor(f.status, theme)} bold>{f.status}</Text>
              <Text> </Text>
              <Text color={theme.textDim}>{f.file}</Text>
              <Box flexGrow={1} />
              {f.package && <Text color={theme.textDim}>{f.package}</Text>}
            </Box>
          ))}
          {unstaged.length === 0 && (
            <Text color={theme.textDim}>  No changes</Text>
          )}
        </Box>

        {/* Recent commits */}
        {commits.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color={theme.textDim}>{sectionDivider('RECENT COMMITS', innerWidth)}</Text>
            {commits.map((c) => (
              <Box key={c.hash}>
                <Text color={theme.textDim}>{c.hash}</Text>
                <Text> </Text>
                <Text color={theme.textDim}>{c.message}</Text>
                <Box flexGrow={1} />
                <Text color={theme.textDim}>{c.time}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Spacer to push footer to bottom */}
      <Box flexGrow={1} />

      {/* Footer border */}
      <Text color={theme.border}>{bottomBorder}</Text>
    </Box>
  );
}
