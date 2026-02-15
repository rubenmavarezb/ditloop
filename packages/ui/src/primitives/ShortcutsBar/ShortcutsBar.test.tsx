import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { ShortcutsBar } from './ShortcutsBar.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ShortcutsBar', () => {
  it('renders shortcut keys and labels', () => {
    const { lastFrame } = renderWithTheme(
      <ShortcutsBar shortcuts={[
        { key: 'q', label: 'quit' },
        { key: '↑↓', label: 'navigate' },
      ]} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('[q]');
    expect(frame).toContain('quit');
    expect(frame).toContain('[↑↓]');
    expect(frame).toContain('navigate');
  });

  it('renders empty with no shortcuts', () => {
    const { lastFrame } = renderWithTheme(
      <ShortcutsBar shortcuts={[]} />
    );
    expect(lastFrame()).toBeDefined();
  });
});
