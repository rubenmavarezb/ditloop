import { Box } from 'ink';
import { ThemeProvider, TaskItem } from '@ditloop/ui';
import type { TaskItemData } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'TaskItem',
  category: 'composite',
};

const now = new Date();

const tasks: TaskItemData[] = [
  { title: 'Deploy to production', status: 'active', updatedAt: now },
  { title: 'Write unit tests', status: 'completed', updatedAt: new Date(now.getTime() - 30 * 60 * 1000) },
  { title: 'Code review PR #42', status: 'pending', updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
  { title: 'Update documentation', status: 'pending', updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
];

export function Default() {
  return (
    <ThemeProvider>
      <Box flexDirection="column">
        {tasks.map((task, i) => (
          <TaskItem key={i} task={task} isSelected={i === 0} />
        ))}
      </Box>
    </ThemeProvider>
  );
}

export function SingleActive() {
  return (
    <ThemeProvider>
      <TaskItem task={tasks[0]} isSelected />
    </ThemeProvider>
  );
}
