import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { PanelContainer } from './PanelContainer.js';
import type { ResolvedPanel } from '../LayoutEngine/index.js';

describe('PanelContainer', () => {
  it('renders panels grouped by row', () => {
    const panels: ResolvedPanel[] = [
      { panelId: 'a', x: 0, y: 0, width: 20, height: 5 },
      { panelId: 'b', x: 20, y: 0, width: 20, height: 5 },
      { panelId: 'c', x: 0, y: 5, width: 40, height: 5 },
    ];

    const { lastFrame } = render(
      <PanelContainer
        panels={panels}
        renderPanel={(id) => <Text>{id}</Text>}
      />,
    );

    const frame = lastFrame();
    expect(frame).toContain('a');
    expect(frame).toContain('b');
    expect(frame).toContain('c');
  });

  it('renders with a single panel', () => {
    const panels: ResolvedPanel[] = [
      { panelId: 'solo', x: 0, y: 0, width: 80, height: 24 },
    ];

    const { lastFrame } = render(
      <PanelContainer
        panels={panels}
        renderPanel={(id) => <Text>{id}</Text>}
      />,
    );

    expect(lastFrame()).toContain('solo');
  });

  it('passes correct dimensions to renderPanel', () => {
    const panels: ResolvedPanel[] = [
      { panelId: 'test', x: 0, y: 0, width: 42, height: 10 },
    ];

    const received: { id: string; w: number; h: number }[] = [];

    render(
      <PanelContainer
        panels={panels}
        renderPanel={(id, w, h) => {
          received.push({ id, w, h });
          return <Text>{id}</Text>;
        }}
      />,
    );

    expect(received).toContainEqual({ id: 'test', w: 42, h: 10 });
  });
});
