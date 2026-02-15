import { Box } from 'ink';
import { Breadcrumb, ThemeProvider } from '@ditloop/ui';

export function BreadcrumbStory() {
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
