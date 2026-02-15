import { Text } from 'ink';
import { ThemeProvider, SelectList } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'SelectList',
  category: 'input',
};

const items = ['Build project', 'Run tests', 'Deploy staging', 'Open PR', 'Merge to main'];

function renderItem(item: string, _index: number, isSelected: boolean) {
  return <Text>{isSelected ? `❯ ${item}` : `  ${item}`}</Text>;
}

export function Default() {
  return (
    <ThemeProvider>
      <SelectList
        items={items}
        renderItem={renderItem}
        onSelect={() => {}}
      />
    </ThemeProvider>
  );
}
