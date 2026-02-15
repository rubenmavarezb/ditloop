import { Box } from 'ink';
import { Header, ThemeProvider } from '@ditloop/ui';

export function HeaderStory() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Header segments={['ditloop', 'Home']} rightText="v0.1.0" />
        <Header segments={['ditloop', 'Pivotree', 'project-x']} rightText="ruben@pivotree.com" />
      </Box>
    </ThemeProvider>
  );
}
