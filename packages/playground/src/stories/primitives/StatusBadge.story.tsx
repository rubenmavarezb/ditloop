import { Box } from 'ink';
import { StatusBadge, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'StatusBadge',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <StatusBadge variant="active" label="Running" />
        <StatusBadge variant="warning" label="Pending" />
        <StatusBadge variant="error" label="Failed" />
        <StatusBadge variant="idle" label="Stopped" />
      </Box>
    </ThemeProvider>
  );
}

export function Active() {
  return (
    <ThemeProvider>
      <StatusBadge variant="active" label="Running" />
    </ThemeProvider>
  );
}

export function Error() {
  return (
    <ThemeProvider>
      <StatusBadge variant="error" label="Failed" />
    </ThemeProvider>
  );
}
