import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Breadcrumb } from './Breadcrumb.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Breadcrumb', () => {
  it('renders all segments', () => {
    const { lastFrame } = renderWithTheme(
      <Breadcrumb segments={['ditloop', 'Pivotree', '#042']} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('ditloop');
    expect(frame).toContain('Pivotree');
    expect(frame).toContain('#042');
  });

  it('renders the icon prefix', () => {
    const { lastFrame } = renderWithTheme(
      <Breadcrumb segments={['home']} />
    );
    expect(lastFrame()).toContain('◉');
  });

  it('renders separators between segments', () => {
    const { lastFrame } = renderWithTheme(
      <Breadcrumb segments={['a', 'b']} />
    );
    expect(lastFrame()).toContain('❯');
  });
});
