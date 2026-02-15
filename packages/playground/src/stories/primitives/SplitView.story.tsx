import { Text } from 'ink';
import { SplitView, Panel, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'SplitView',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <SplitView
        left={
          <Panel title="Sidebar">
            <Text>Left pane (30%)</Text>
          </Panel>
        }
        right={
          <Panel title="Main">
            <Text>Right pane (70%)</Text>
          </Panel>
        }
        ratio={[30, 70]}
      />
    </ThemeProvider>
  );
}

export function EvenSplit() {
  return (
    <ThemeProvider>
      <SplitView
        left={
          <Panel title="Left">
            <Text>50%</Text>
          </Panel>
        }
        right={
          <Panel title="Right">
            <Text>50%</Text>
          </Panel>
        }
        ratio={[50, 50]}
      />
    </ThemeProvider>
  );
}
