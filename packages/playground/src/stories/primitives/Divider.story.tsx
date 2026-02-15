import { Box } from 'ink';
import { Divider, ThemeProvider } from '@ditloop/ui';

export function DividerStory() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Divider width={40} />
        <Divider width={40} label="Section" />
        <Divider width={20} label="Short" />
      </Box>
    </ThemeProvider>
  );
}
