import { Box } from 'ink';
import { StatusBadge, ThemeProvider } from '@ditloop/ui';

export function StatusBadgeStory() {
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
