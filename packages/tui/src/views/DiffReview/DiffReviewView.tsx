import { Box, Text, useInput } from 'ink';
import { Panel, StatusBadge, useTheme, useScrollable } from '@ditloop/ui';
import type { Action } from '@ditloop/core';

/** Risk level for an action. */
export type RiskLevel = 'safe' | 'caution' | 'danger';

/** A reviewable action with its diff and metadata. */
export interface ReviewableAction {
  id: string;
  action: Action;
  diff?: string;
  risk: RiskLevel;
}

/** Props for the DiffReviewView. */
export interface DiffReviewViewProps {
  actions: ReviewableAction[];
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
  onApproveAll?: () => void;
  onEdit?: (actionId: string) => void;
}

/**
 * Assess risk level for an action.
 *
 * @param action - The action to assess
 * @returns Risk level
 */
export function assessRisk(action: Action): RiskLevel {
  if (action.type === 'shell_command') {
    const cmd = action.command.toLowerCase();
    if (/rm\s|sudo|chmod|chown|kill|shutdown/.test(cmd)) return 'danger';
    if (/install|uninstall|upgrade|downgrade/.test(cmd)) return 'caution';
    return 'safe';
  }
  if (action.type === 'git_operation') {
    if (action.operation === 'push') return 'caution';
    return 'safe';
  }
  if (action.type === 'file_edit' || action.type === 'file_create') {
    return 'safe';
  }
  return 'safe';
}

/**
 * TUI view for reviewing AI-proposed changes with unified diffs,
 * risk indicators, and approve/reject controls.
 */
export function DiffReviewView({
  actions,
  onApprove,
  onReject,
  onApproveAll,
  onEdit,
}: DiffReviewViewProps) {
  const theme = useTheme();
  const { selectedIndex, moveUp, moveDown } = useScrollable(actions.length, Math.min(actions.length, 10));

  useInput((input, key) => {
    if (key.upArrow) moveUp();
    if (key.downArrow) moveDown();

    if (actions.length === 0) return;

    const currentAction = actions[selectedIndex];
    if (input === 'y') onApprove?.(currentAction.id);
    if (input === 'n') onReject?.(currentAction.id);
    if (input === 'e') onEdit?.(currentAction.id);
    if (input === 'a') onApproveAll?.();
  });

  if (actions.length === 0) {
    return (
      <Box paddingX={1}>
        <Text color={theme.textDim}>No actions to review.</Text>
      </Box>
    );
  }

  const currentAction = actions[selectedIndex];

  return (
    <Box flexDirection="column" width="100%" paddingX={1} gap={1}>
      <Text bold color={theme.accent}>
        Review Proposed Changes ({selectedIndex + 1}/{actions.length})
      </Text>

      {/* Action list */}
      <Box flexDirection="column" gap={0}>
        {actions.map((item, idx) => (
          <Box key={item.id}>
            <Text color={idx === selectedIndex ? theme.accent : theme.textDim}>
              {idx === selectedIndex ? '▸ ' : '  '}
              {actionLabel(item.action)}
              {'  '}
            </Text>
            <RiskBadge risk={item.risk} />
          </Box>
        ))}
      </Box>

      {/* Diff view for selected action */}
      <Panel title={actionLabel(currentAction.action)}>
        <Box flexDirection="column">
          {currentAction.diff ? (
            <DiffView diff={currentAction.diff} />
          ) : (
            <ActionDetail action={currentAction.action} />
          )}
        </Box>
      </Panel>

      <Text color={theme.textDim}>
        y: approve  n: reject  e: edit  a: approve all  ↑↓: navigate
      </Text>
    </Box>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const variant = risk === 'danger' ? 'error' : risk === 'caution' ? 'warning' : 'active';
  return <StatusBadge variant={variant} label={risk} />;
}

function DiffView({ diff }: { diff: string }) {
  const theme = useTheme();
  const lines = diff.split('\n');

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => {
        let color = theme.textDim;
        if (line.startsWith('+')) color = theme.active;
        else if (line.startsWith('-')) color = theme.error;
        else if (line.startsWith('@@')) color = theme.accent;

        return (
          <Text key={idx} color={color}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
}

function ActionDetail({ action }: { action: Action }) {
  const theme = useTheme();

  switch (action.type) {
    case 'file_create':
      return <Text color={theme.text}>Create: {action.path}</Text>;
    case 'file_edit':
      return <Text color={theme.text}>Edit: {action.path}</Text>;
    case 'shell_command':
      return <Text color={theme.text}>Run: {action.command}</Text>;
    case 'git_operation':
      return <Text color={theme.text}>Git: {action.operation}</Text>;
  }
}

function actionLabel(action: Action): string {
  switch (action.type) {
    case 'file_create':
      return `Create ${action.path}`;
    case 'file_edit':
      return `Edit ${action.path}`;
    case 'shell_command':
      return `Run: ${action.command}`;
    case 'git_operation':
      return `Git: ${action.operation}`;
  }
}
