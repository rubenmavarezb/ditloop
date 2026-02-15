import { Box } from 'ink';
import { Breadcrumb, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'Breadcrumb',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Breadcrumb segments={['ditloop']} />
        <Breadcrumb segments={['ditloop', 'Pivotree']} />
        <Breadcrumb segments={['ditloop', 'Pivotree', '#042']} />
      </Box>
    </ThemeProvider>
  );
}

export function Deep() {
  return (
    <ThemeProvider>
      <Breadcrumb segments={['ditloop', 'Pivotree', 'project-x', '#042']} />
    </ThemeProvider>
  );
}
