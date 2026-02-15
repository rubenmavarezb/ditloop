import { Text } from 'ink';
import { Panel, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'Panel',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <Panel title="Basic Panel" badge="3">
        <Text>This is a panel with a title and badge.</Text>
      </Panel>
    </ThemeProvider>
  );
}

export function WithoutBadge() {
  return (
    <ThemeProvider>
      <Panel title="No Badge">
        <Text>A panel without a badge.</Text>
      </Panel>
    </ThemeProvider>
  );
}

export function Minimal() {
  return (
    <ThemeProvider>
      <Panel>
        <Text>A panel with no title or badge.</Text>
      </Panel>
    </ThemeProvider>
  );
}
