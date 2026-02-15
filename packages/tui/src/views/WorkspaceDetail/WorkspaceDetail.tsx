import { Box, Text, useInput } from 'ink';
import { Panel, StatusBadge, useTheme } from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';
import type { GitStatus } from '@ditloop/core';
import { useState } from 'react';

/** Props for the WorkspaceDetail view. */
export interface WorkspaceDetailProps {
  workspace: WorkspaceItemData;
  gitStatus?: GitStatus;
  identityMatch?: boolean;
  profileName?: string;
  tasks?: Array<{ id: string; title: string; status: string }>;
  onCommit?: () => void;
  onPush?: () => void;
  onBranches?: () => void;
}

type PanelFocus = 'git' | 'identity' | 'tasks' | 'actions';
const PANELS: PanelFocus[] = ['git', 'identity', 'tasks', 'actions'];

/**
 * Workspace detail view — a developer context dashboard with 4 panels:
 * git status, identity health, AIDF tasks, and quick actions.
 */
export function WorkspaceDetail({
  workspace,
  gitStatus,
  identityMatch,
  profileName,
  tasks = [],
  onCommit,
  onPush,
  onBranches,
}: WorkspaceDetailProps) {
  const theme = useTheme();
  const [focusedPanel, setFocusedPanel] = useState<PanelFocus>('git');

  useInput((input, key) => {
    // Tab cycles through panels
    if (key.tab) {
      const idx = PANELS.indexOf(focusedPanel);
      setFocusedPanel(PANELS[(idx + 1) % PANELS.length]);
      return;
    }

    // Quick action shortcuts
    if (focusedPanel === 'actions' || input === 'c' || input === 'p' || input === 'b') {
      if (input === 'c') onCommit?.();
      if (input === 'p') onPush?.();
      if (input === 'b') onBranches?.();
    }
  });

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <Box flexDirection="column" width="100%" gap={1} paddingX={1}>
      <Text bold color={theme.accent}>
        {workspace.name}
      </Text>

      <Box flexDirection="row" gap={1} width="100%">
        {/* Git Status Panel */}
        <Box flexDirection="column" width="50%">
          <Panel
            title="Git Status"
            badge={gitStatus?.isDirty ? 'dirty' : 'clean'}
          >
            <Box flexDirection="column" gap={0}>
              <Text color={theme.text}>
                Branch: <Text bold>{gitStatus?.currentBranch ?? '—'}</Text>
                {gitStatus?.isDetachedHead ? <Text color={theme.warning}> (detached)</Text> : null}
              </Text>
              {gitStatus?.tracking ? (
                <Text color={theme.textDim}>
                  Tracking: {gitStatus.tracking}
                  {gitStatus.ahead > 0 ? ` ↑${gitStatus.ahead}` : ''}
                  {gitStatus.behind > 0 ? ` ↓${gitStatus.behind}` : ''}
                </Text>
              ) : null}
              <Text color={theme.textDim}>
                Staged: {gitStatus?.staged.length ?? 0}
                {'  '}Modified: {gitStatus?.unstaged.length ?? 0}
                {'  '}Untracked: {gitStatus?.untracked.length ?? 0}
              </Text>
            </Box>
          </Panel>
        </Box>

        {/* Identity Panel */}
        <Box flexDirection="column" width="50%">
          <Panel title="Identity">
            <Box flexDirection="column">
              <Text color={theme.text}>
                Profile: <Text bold>{profileName ?? '—'}</Text>
              </Text>
              <StatusBadge
                variant={identityMatch === undefined ? 'idle' : identityMatch ? 'active' : 'error'}
                label={identityMatch === undefined ? 'Checking...' : identityMatch ? 'Matched' : 'Mismatch'}
              />
            </Box>
          </Panel>
        </Box>
      </Box>

      <Box flexDirection="row" gap={1} width="100%">
        {/* AIDF Tasks Panel */}
        <Box flexDirection="column" width="50%">
          <Panel
            title="AIDF Tasks"
            badge={`${tasks.length}`}
          >
            <Box flexDirection="column">
              {tasks.length === 0 ? (
                <Text color={theme.textDim}>No AIDF tasks found</Text>
              ) : (
                <>
                  {inProgressTasks.length > 0 ? (
                    <Text color={theme.warning}>In Progress: {inProgressTasks.length}</Text>
                  ) : null}
                  {pendingTasks.length > 0 ? (
                    <Text color={theme.textDim}>Pending: {pendingTasks.length}</Text>
                  ) : null}
                  {doneTasks.length > 0 ? (
                    <Text color={theme.active}>Done: {doneTasks.length}</Text>
                  ) : null}
                </>
              )}
            </Box>
          </Panel>
        </Box>

        {/* Quick Actions Panel */}
        <Box flexDirection="column" width="50%">
          <Panel title="Quick Actions">
            <Box flexDirection="column">
              <Text color={focusedPanel === 'actions' ? theme.accent : theme.textDim}>
                [c] Commit
              </Text>
              <Text color={focusedPanel === 'actions' ? theme.accent : theme.textDim}>
                [p] Push
              </Text>
              <Text color={focusedPanel === 'actions' ? theme.accent : theme.textDim}>
                [b] Branches
              </Text>
            </Box>
          </Panel>
        </Box>
      </Box>

      <Text color={theme.textDim}>
        Tab: switch panels  |  c/p/b: quick actions  |  Esc: back
      </Text>
    </Box>
  );
}
