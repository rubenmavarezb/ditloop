import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';
import { formatRelativeTime } from '../../data-display/RelativeTime/RelativeTime.js';

/** Task status for display purposes. */
export type TaskStatus = 'active' | 'completed' | 'pending';

/** Minimal task data needed for rendering. */
export interface TaskItemData {
  /** Task title. */
  title: string;
  /** Task status. */
  status: TaskStatus;
  /** Last updated time. */
  updatedAt: Date;
}

/** Props for the TaskItem component. */
export interface TaskItemProps {
  /** Task data to display. */
  task: TaskItemData;
  /** Whether this item is currently selected. */
  isSelected: boolean;
}

const statusIcons: Record<TaskStatus, string> = {
  active: '●',
  completed: '✓',
  pending: '○',
};

/**
 * Task entry showing status icon, title, and relative time.
 *
 * @param props - Task item configuration
 */
export function TaskItem({ task, isSelected }: TaskItemProps) {
  const theme = useTheme();
  const icon = statusIcons[task.status];
  const iconColor =
    task.status === 'active' ? theme.active :
    task.status === 'completed' ? theme.textDim :
    theme.idle;

  return (
    <Box>
      <Text color={isSelected ? theme.accent : undefined}>
        {isSelected ? '❯ ' : '  '}
      </Text>
      <Text color={iconColor}>{icon} </Text>
      <Text bold={isSelected} color={isSelected ? theme.text : theme.textDim}>
        {task.title}
      </Text>
      <Text color={theme.textDim}> {formatRelativeTime(task.updatedAt)}</Text>
    </Box>
  );
}
