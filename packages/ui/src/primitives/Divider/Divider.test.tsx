import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Divider } from './Divider.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Divider', () => {
  it('renders a horizontal line', () => {
    const { lastFrame } = renderWithTheme(<Divider width={10} />);
    expect(lastFrame()).toContain('──────────');
  });

  it('renders a label in the center', () => {
    const { lastFrame } = renderWithTheme(<Divider width={20} label="test" />);
    const frame = lastFrame()!;
    expect(frame).toContain('test');
    expect(frame).toContain('─');
  });
});
