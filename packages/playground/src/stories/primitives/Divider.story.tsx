import { Box } from 'ink';
import { Divider, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'Divider',
  category: 'primitives',
};

export function Default() {
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

export function WithLabel() {
  return (
    <ThemeProvider>
      <Divider width={40} label="Named Section" />
    </ThemeProvider>
  );
}
