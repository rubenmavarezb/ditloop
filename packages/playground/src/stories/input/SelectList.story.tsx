import { Text } from 'ink';
import { ThemeProvider, SelectList } from '@ditloop/ui';

const items = ['Build project', 'Run tests', 'Deploy staging', 'Open PR', 'Merge to main'];

function renderItem(item: string, _index: number, isSelected: boolean) {
  return <Text>{isSelected ? `❯ ${item}` : `  ${item}`}</Text>;
}

export function SelectListStory() {
  return (
    <ThemeProvider>
      <SelectList
        items={items}
        renderItem={renderItem}
        onSelect={(item) => {}}
      />
    </ThemeProvider>
  );
}
