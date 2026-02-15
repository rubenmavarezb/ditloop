import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { StatusBadge } from './StatusBadge.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('StatusBadge', () => {
  it('renders the label', () => {
    const { lastFrame } = renderWithTheme(
      <StatusBadge variant="active" label="Running" />
    );
    expect(lastFrame()).toContain('Running');
  });

  it('renders the dot indicator', () => {
    const { lastFrame } = renderWithTheme(
      <StatusBadge variant="error" label="Failed" />
    );
    expect(lastFrame()).toContain('●');
  });

  it('renders all variants without errors', () => {
    const variants = ['active', 'warning', 'error', 'idle'] as const;
    for (const variant of variants) {
      const { lastFrame } = renderWithTheme(
        <StatusBadge variant={variant} label={variant} />
      );
      expect(lastFrame()).toContain(variant);
    }
  });
});
