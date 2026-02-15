import { render, Text, Box } from 'ink';
import { ThemeProvider } from '@ditloop/ui';
import * as stories from './stories/index.js';

type StoryComponent = () => JSX.Element;

const storyMap: Record<string, StoryComponent> = {
  panel: stories.PanelStory,
  divider: stories.DividerStory,
  'status-badge': stories.StatusBadgeStory,
  breadcrumb: stories.BreadcrumbStory,
  header: stories.HeaderStory,
  'shortcuts-bar': stories.ShortcutsBarStory,
  'split-view': stories.SplitViewStory,
  sidebar: stories.SidebarStory,
  'select-list': stories.SelectListStory,
  'relative-time': stories.RelativeTimeStory,
  'task-item': stories.TaskItemStory,
  'workspace-item': stories.WorkspaceItemStory,
};

const storyName = process.argv[2];

if (!storyName || storyName === '--list') {
  console.log('◉ ditloop playground v0.1.0');
  console.log('');
  console.log('Available stories:');
  for (const name of Object.keys(storyMap)) {
    console.log(`  - ${name}`);
  }
  console.log('');
  console.log('Usage: ditloop-playground <story-name>');
  process.exit(0);
}

const Story = storyMap[storyName];
if (!Story) {
  console.error(`Unknown story: "${storyName}"`);
  console.error(`Run with --list to see available stories.`);
  process.exit(1);
}

function App() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Text bold>◉ {storyName}</Text>
        <Story />
      </Box>
    </ThemeProvider>
  );
}

render(<App />);
