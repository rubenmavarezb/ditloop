import { Text } from 'ink';
import { Panel, ThemeProvider } from '@ditloop/ui';

export function PanelStory() {
  return (
    <ThemeProvider>
      <Panel title="Basic Panel" badge="3">
        <Text>This is a panel with a title and badge.</Text>
      </Panel>
      <Panel title="No Badge">
        <Text>A panel without a badge.</Text>
      </Panel>
      <Panel>
        <Text>A panel with no title or badge.</Text>
      </Panel>
    </ThemeProvider>
  );
}
