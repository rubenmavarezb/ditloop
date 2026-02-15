import { Box } from 'ink';
import { Header, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'Header',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Header segments={['ditloop', 'Home']} rightText="v0.1.0" />
        <Header segments={['ditloop', 'Pivotree', 'project-x']} rightText="ruben@pivotree.com" />
      </Box>
    </ThemeProvider>
  );
}

export function Simple() {
  return (
    <ThemeProvider>
      <Header segments={['ditloop', 'Home']} />
    </ThemeProvider>
  );
}
