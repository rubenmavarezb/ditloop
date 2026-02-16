import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { FocusablePanel } from './FocusablePanel.js';

function renderWithTheme(element: React.ReactElement) {
  return render(<ThemeProvider>{element}</ThemeProvider>);
}

describe('FocusablePanel', () => {
  it('renders title text', () => {
    const { lastFrame } = renderWithTheme(
      <FocusablePanel title="Git Status" focused={false}>
        <Text>content</Text>
      </FocusablePanel>,
    );
    expect(lastFrame()).toContain('Git Status');
    expect(lastFrame()).toContain('content');
  });

  it('renders panel number in title when provided', () => {
    const { lastFrame } = renderWithTheme(
      <FocusablePanel title="Tasks" focused={false} panelNumber={2}>
        <Text>tasks</Text>
      </FocusablePanel>,
    );
    expect(lastFrame()).toContain('[2] Tasks');
  });

  it('renders badge when provided', () => {
    const { lastFrame } = renderWithTheme(
      <FocusablePanel title="Status" focused={false} badge="3 files">
        <Text>body</Text>
      </FocusablePanel>,
    );
    expect(lastFrame()).toContain('[3 files]');
  });

  it('renders without badge when not provided', () => {
    const { lastFrame } = renderWithTheme(
      <FocusablePanel title="Panel" focused={true}>
        <Text>ok</Text>
      </FocusablePanel>,
    );
    expect(lastFrame()).toContain('Panel');
    expect(lastFrame()).not.toContain('[');
  });

  it('renders focused and unfocused states', () => {
    const { lastFrame: focusedFrame } = renderWithTheme(
      <FocusablePanel title="Test" focused={true}>
        <Text>f</Text>
      </FocusablePanel>,
    );
    const { lastFrame: unfocusedFrame } = renderWithTheme(
      <FocusablePanel title="Test" focused={false}>
        <Text>f</Text>
      </FocusablePanel>,
    );

    // Both should render (we can't easily test border colors in text output)
    expect(focusedFrame()).toContain('Test');
    expect(unfocusedFrame()).toContain('Test');
  });
});
