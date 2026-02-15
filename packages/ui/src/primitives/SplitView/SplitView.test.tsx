import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { SplitView } from './SplitView.js';

describe('SplitView', () => {
  it('renders both panes', () => {
    const { lastFrame } = render(
      <SplitView
        left={<Text>Left</Text>}
        right={<Text>Right</Text>}
      />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Left');
    expect(frame).toContain('Right');
  });

  it('accepts custom ratio', () => {
    const { lastFrame } = render(
      <SplitView
        left={<Text>A</Text>}
        right={<Text>B</Text>}
        ratio={[50, 50]}
      />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('A');
    expect(frame).toContain('B');
  });
});
