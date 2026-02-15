import { useState, useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme, Panel, Header, ShortcutsBar, Divider } from '@ditloop/ui';
import { registry, getCategories } from './registry.js';
import type { StoryEntry } from './stories/story.types.js';

const SHORTCUTS = [
  { key: '↑↓', label: 'navigate' },
  { key: 'v', label: 'variant' },
  { key: 'q', label: 'quit' },
];

/** Flat list item representing a category header or a story entry. */
type ListItem =
  | { kind: 'category'; name: string }
  | { kind: 'story'; entry: StoryEntry; indexInCategory: number };

/** Build a flat list of categories and stories for the sidebar. */
function buildFlatList(): ListItem[] {
  const categories = getCategories();
  const items: ListItem[] = [];
  for (const cat of categories) {
    items.push({ kind: 'category', name: cat });
    const stories = registry.filter((e) => e.meta.category === cat);
    stories.forEach((entry, i) => {
      items.push({ kind: 'story', entry, indexInCategory: i });
    });
  }
  return items;
}

/** Find the index of the first story item in the flat list. */
function firstStoryIndex(items: ListItem[]): number {
  return items.findIndex((item) => item.kind === 'story');
}

/** Inner catalog using theme context. */
function CatalogInner() {
  const theme = useTheme();
  const { exit } = useApp();

  const flatList = useMemo(() => buildFlatList(), []);
  const [selectedIndex, setSelectedIndex] = useState(() => firstStoryIndex(flatList));
  const [variantIndex, setVariantIndex] = useState(0);

  const selectedItem = flatList[selectedIndex];
  const selectedStory = selectedItem?.kind === 'story' ? selectedItem.entry : null;

  const variantNames = selectedStory ? Object.keys(selectedStory.variants) : [];
  const currentVariantName = variantNames[variantIndex] ?? 'Default';
  const CurrentVariant = selectedStory?.variants[currentVariantName] ?? null;

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && flatList[next].kind === 'category') {
          next--;
        }
        return next >= 0 ? next : prev;
      });
      setVariantIndex(0);
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => {
        let next = prev + 1;
        while (next < flatList.length && flatList[next].kind === 'category') {
          next++;
        }
        return next < flatList.length ? next : prev;
      });
      setVariantIndex(0);
      return;
    }

    if (input === 'v' && variantNames.length > 0) {
      setVariantIndex((prev) => (prev + 1) % variantNames.length);
      return;
    }
  });

  return (
    <Box flexDirection="column" width="100%">
      <Header
        segments={['ditloop', 'playground']}
        rightText="v0.1.0"
      />
      <Box flexDirection="row" width="100%" flexGrow={1}>
        {/* Sidebar — story list */}
        <Box flexDirection="column" width={28} flexShrink={0} borderStyle="single" borderColor={theme.border} paddingX={1}>
          <Box marginBottom={1}>
            <Text bold color={theme.accent}>Components</Text>
          </Box>
          {flatList.map((item, i) => {
            if (item.kind === 'category') {
              return (
                <Box key={`cat-${item.name}`} marginTop={i > 0 ? 1 : 0}>
                  <Text bold color={theme.textDim}>{item.name}</Text>
                </Box>
              );
            }
            const isSelected = i === selectedIndex;
            return (
              <Box key={`story-${item.entry.meta.title}`}>
                <Text
                  color={isSelected ? theme.accent : theme.text}
                  bold={isSelected}
                >
                  {isSelected ? '❯ ' : '  '}{item.entry.meta.title}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Main — story preview */}
        <Box flexDirection="column" flexGrow={1} paddingX={2} paddingY={1}>
          {selectedStory ? (
            <>
              <Box marginBottom={1}>
                <Text bold color={theme.text}>
                  {selectedStory.meta.title}
                </Text>
                <Text color={theme.textDim}>
                  {' '}— {selectedStory.meta.category}
                </Text>
              </Box>

              {variantNames.length > 1 && (
                <Box marginBottom={1}>
                  <Text color={theme.textDim}>Variant: </Text>
                  {variantNames.map((name, i) => (
                    <Text
                      key={name}
                      color={i === variantIndex ? theme.accent : theme.textDim}
                      bold={i === variantIndex}
                    >
                      {i > 0 ? ' │ ' : ''}{name}
                    </Text>
                  ))}
                  <Text color={theme.textDim}> ({variantIndex + 1}/{variantNames.length})</Text>
                </Box>
              )}

              <Divider width={50} />

              <Box marginTop={1}>
                {CurrentVariant ? <CurrentVariant /> : <Text color={theme.textDim}>No variant</Text>}
              </Box>

              <Box marginTop={1}>
                <Divider width={50} label="Props" />
              </Box>
              <Box marginTop={1} flexDirection="column">
                <Text color={theme.textDim}>
                  Variants: {variantNames.join(', ')}
                </Text>
                <Text color={theme.textDim}>
                  Category: {selectedStory.meta.category}
                </Text>
              </Box>
            </>
          ) : (
            <Text color={theme.textDim}>Select a component from the sidebar</Text>
          )}
        </Box>
      </Box>
      <ShortcutsBar shortcuts={SHORTCUTS} />
    </Box>
  );
}

/** Root catalog application component. */
export function CatalogApp() {
  return (
    <ThemeProvider>
      <CatalogInner />
    </ThemeProvider>
  );
}
