import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Task status for display. */
export type PanelTaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked';

/** A task entry for the panel. */
export interface PanelTaskEntry {
  /** Task ID (e.g., 'TASK-001'). */
  id: string;
  /** Task title. */
  title: string;
  /** Task status. */
  status: PanelTaskStatus;
}

/** Props for the TasksPanel component. */
export interface TasksPanelProps {
  /** Array of tasks to display. */
  tasks: PanelTaskEntry[];
  /** Currently selected task index. */
  selectedIndex: number;
  /** Status filter (null = show all). */
  filter: PanelTaskStatus | null;
  /** Called when a task is highlighted. */
  onTaskSelect?: (taskId: string) => void;
}

const STATUS_ICONS: Record<PanelTaskStatus, string> = {
  'pending': '○',
  'in-progress': '◐',
  'done': '●',
  'blocked': '✕',
};

/**
 * Display AIDF tasks with status icons and color coding.
 * Supports filtering by status and emits selection events.
 *
 * @param props - Task data and callbacks
 */
export function TasksPanel({
  tasks,
  selectedIndex,
  filter,
}: TasksPanelProps) {
  const theme = useTheme();

  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const statusColor = (status: PanelTaskStatus): string => {
    switch (status) {
      case 'done': return theme.active;
      case 'in-progress': return theme.warning;
      case 'blocked': return theme.error;
      default: return theme.textDim;
    }
  };

  if (filtered.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>
          {tasks.length === 0 ? 'No tasks found' : 'No tasks match filter'}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color={theme.textDim}>
        [{doneCount}/{tasks.length}]{filter ? ` filter: ${filter}` : ''}
      </Text>
      {filtered.map((task, i) => {
        const selected = i === selectedIndex;
        const color = selected ? theme.accent : statusColor(task.status);
        return (
          <Text key={task.id} color={color}>
            {selected ? '>' : ' '} {STATUS_ICONS[task.status]} {task.id} {task.title}
          </Text>
        );
      })}
    </Box>
  );
}
