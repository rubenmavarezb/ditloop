import { Box, Text } from 'ink';
import { useTheme, Panel } from '@ditloop/ui';

/** Props for the TaskDetail view. */
export interface TaskDetailProps {
  /** Task title. */
  title?: string;
  /** Task description. */
  description?: string;
  /** Task status. */
  status?: string;
}

/**
 * Task detail view showing title, description, and status.
 * Currently a placeholder for future task management functionality.
 */
export function TaskDetail({ title, description, status }: TaskDetailProps) {
  const theme = useTheme();

  return (
    <Panel title="Task Detail">
      <Box flexDirection="column" gap={1}>
        {title ? (
          <>
            <Text bold color={theme.text}>{title}</Text>
            {status && (
              <Text color={theme.textDim}>Status: {status}</Text>
            )}
            {description && (
              <Text color={theme.textDim}>{description}</Text>
            )}
          </>
        ) : (
          <Text color={theme.textDim}>No task selected</Text>
        )}
      </Box>
    </Panel>
  );
}
