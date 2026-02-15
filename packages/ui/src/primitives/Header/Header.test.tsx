import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Header } from './Header.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Header', () => {
  it('renders breadcrumb segments', () => {
    const { lastFrame } = renderWithTheme(
      <Header segments={['ditloop', 'Home']} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('ditloop');
    expect(frame).toContain('Home');
  });

  it('renders right text when provided', () => {
    const { lastFrame } = renderWithTheme(
      <Header segments={['ditloop']} rightText="v0.1.0" />
    );
    expect(lastFrame()).toContain('v0.1.0');
  });
});
