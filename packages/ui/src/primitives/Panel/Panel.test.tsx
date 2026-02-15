import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { Panel } from './Panel.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Panel', () => {
  it('renders children', () => {
    const { lastFrame } = renderWithTheme(
      <Panel><Text>Hello</Text></Panel>
    );
    expect(lastFrame()).toContain('Hello');
  });

  it('renders title when provided', () => {
    const { lastFrame } = renderWithTheme(
      <Panel title="My Panel"><Text>Content</Text></Panel>
    );
    expect(lastFrame()).toContain('My Panel');
  });

  it('renders badge when provided', () => {
    const { lastFrame } = renderWithTheme(
      <Panel title="Panel" badge="3"><Text>Content</Text></Panel>
    );
    expect(lastFrame()).toContain('[3]');
  });

  it('renders border', () => {
    const { lastFrame } = renderWithTheme(
      <Panel><Text>Content</Text></Panel>
    );
    const frame = lastFrame()!;
    // Round border style uses ╭ ╮ ╰ ╯
    expect(frame).toMatch(/[╭╮╰╯│─]/);
  });
});
