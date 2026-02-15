import { Text } from 'ink';
import { SplitView, Panel, ThemeProvider } from '@ditloop/ui';

export function SplitViewStory() {
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
