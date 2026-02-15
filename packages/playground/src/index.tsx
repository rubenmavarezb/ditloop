import { render, Text, Box } from 'ink';
import { ThemeProvider } from '@ditloop/ui';
import { CatalogApp } from './CatalogApp.js';
import { registry } from './registry.js';
import type { StoryVariant } from './stories/story.types.js';

/** Build a flat story map for single-story CLI mode (backwards compat). */
function buildStoryMap(): Record<string, StoryVariant> {
  const map: Record<string, StoryVariant> = {};
  for (const entry of registry) {
    const key = entry.meta.title
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    const defaultVariant = entry.variants['Default'] ?? Object.values(entry.variants)[0];
    if (defaultVariant) {
      map[key] = defaultVariant;
    }
  }
  return map;
}

const args = process.argv.slice(2);
const storyName = args[0];

if (storyName === '--list') {
  const storyMap = buildStoryMap();
  console.log('◉ ditloop playground v0.1.0');
  console.log('');
  console.log('Available stories:');
  for (const name of Object.keys(storyMap)) {
    console.log(`  - ${name}`);
  }
  console.log('');
  console.log('Usage:');
  console.log('  ditloop-playground           # Interactive catalog');
  console.log('  ditloop-playground <story>    # Single story');
  process.exit(0);
}

if (storyName) {
  // Single-story mode
  const storyMap = buildStoryMap();
  const Story = storyMap[storyName];
  if (!Story) {
    console.error(`Unknown story: "${storyName}"`);
    console.error(`Run with --list to see available stories.`);
    process.exit(1);
  }

  function SingleStoryApp() {
    return (
      <ThemeProvider>
        <Box flexDirection="column" gap={1}>
          <Text bold>◉ {storyName}</Text>
          <Story />
        </Box>
      </ThemeProvider>
    );
  }

  render(<SingleStoryApp />);
} else {
  // Interactive catalog mode (default)
  render(<CatalogApp />);
}
