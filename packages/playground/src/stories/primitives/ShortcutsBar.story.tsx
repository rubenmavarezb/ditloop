import { ShortcutsBar, ThemeProvider } from '@ditloop/ui';
import type { StoryMeta } from '../story.types.js';

export const meta: StoryMeta = {
  title: 'ShortcutsBar',
  category: 'primitives',
};

export function Default() {
  return (
    <ThemeProvider>
      <ShortcutsBar shortcuts={[
        { key: 'q', label: 'quit' },
        { key: '↑↓', label: 'navigate' },
        { key: '→', label: 'expand' },
        { key: 'ctrl+b', label: 'sidebar' },
      ]} />
    </ThemeProvider>
  );
}
