import { ShortcutsBar, ThemeProvider } from '@ditloop/ui';

export function ShortcutsBarStory() {
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
