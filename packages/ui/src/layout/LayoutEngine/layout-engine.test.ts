import { describe, it, expect } from 'vitest';
import {
  resolveLayout,
  adjustSplit,
  DEFAULT_WORKSPACE_LAYOUT,
} from './layout-engine.js';
import type { LayoutConfig } from './layout-engine.js';

describe('resolveLayout', () => {
  const simpleConfig: LayoutConfig = {
    rows: [
      {
        height: '50%',
        columns: [
          { panelId: 'left', width: '40%' },
          { panelId: 'right', width: '60%' },
        ],
      },
      {
        height: '50%',
        columns: [
          { panelId: 'bottom-left', width: '40%' },
          { panelId: 'bottom-right', width: '60%' },
        ],
      },
    ],
  };

  it('resolves panels for 80x24 terminal', () => {
    const panels = resolveLayout(simpleConfig, 80, 24);
    expect(panels).toHaveLength(4);

    const left = panels.find((p) => p.panelId === 'left')!;
    expect(left.x).toBe(0);
    expect(left.y).toBe(0);
    expect(left.width).toBe(32); // 40% of 80
    expect(left.height).toBe(12); // 50% of 24

    const right = panels.find((p) => p.panelId === 'right')!;
    expect(right.x).toBe(32);
    expect(right.y).toBe(0);
    expect(right.width).toBe(48); // 60% of 80
    expect(right.height).toBe(12);
  });

  it('resolves panels for 120x40 terminal', () => {
    const panels = resolveLayout(simpleConfig, 120, 40);
    expect(panels).toHaveLength(4);

    const left = panels.find((p) => p.panelId === 'left')!;
    expect(left.width).toBe(48); // 40% of 120
    expect(left.height).toBe(20); // 50% of 40
  });

  it('resolves panels for 200x60 terminal', () => {
    const panels = resolveLayout(simpleConfig, 200, 60);
    expect(panels).toHaveLength(4);

    const left = panels.find((p) => p.panelId === 'left')!;
    expect(left.width).toBe(80); // 40% of 200
    expect(left.height).toBe(30); // 50% of 60
  });

  it('distributes width remainder to last column', () => {
    const config: LayoutConfig = {
      rows: [
        {
          height: '100%',
          columns: [
            { panelId: 'a', width: '33%' },
            { panelId: 'b', width: '33%' },
            { panelId: 'c', width: '34%' },
          ],
        },
      ],
    };
    const panels = resolveLayout(config, 100, 10);
    const totalWidth = panels.reduce((sum, p) => sum + p.width, 0);
    expect(totalWidth).toBe(100);
  });

  it('distributes height remainder to last row', () => {
    const config: LayoutConfig = {
      rows: [
        { height: '33%', columns: [{ panelId: 'a', width: '100%' }] },
        { height: '33%', columns: [{ panelId: 'b', width: '100%' }] },
        { height: '34%', columns: [{ panelId: 'c', width: '100%' }] },
      ],
    };
    const panels = resolveLayout(config, 10, 100);
    const totalHeight = panels.reduce((sum, p) => sum + p.height, 0);
    expect(totalHeight).toBe(100);
  });

  it('handles bottomBar placement', () => {
    const config: LayoutConfig = {
      rows: [
        {
          height: '100%',
          columns: [{ panelId: 'main', width: '100%' }],
        },
      ],
      bottomBar: { panelId: 'bar', height: 6 },
    };
    const panels = resolveLayout(config, 80, 30);

    const main = panels.find((p) => p.panelId === 'main')!;
    expect(main.y).toBe(0);
    expect(main.height).toBe(24); // 30 - 6

    const bar = panels.find((p) => p.panelId === 'bar')!;
    expect(bar.y).toBe(24);
    expect(bar.height).toBe(6);
    expect(bar.width).toBe(80);
    expect(bar.x).toBe(0);
  });

  it('handles rowSpan correctly', () => {
    const config: LayoutConfig = {
      rows: [
        {
          height: '50%',
          columns: [
            { panelId: 'left-top', width: '40%' },
            { panelId: 'right-tall', width: '60%', rowSpan: 2 },
          ],
        },
        {
          height: '50%',
          columns: [
            { panelId: 'left-bottom', width: '40%' },
          ],
        },
      ],
    };
    const panels = resolveLayout(config, 100, 20);

    const rightTall = panels.find((p) => p.panelId === 'right-tall')!;
    expect(rightTall.height).toBe(20); // spans both rows
    expect(rightTall.y).toBe(0);
    expect(rightTall.x).toBe(40);
    expect(rightTall.width).toBe(60);

    const leftBottom = panels.find((p) => p.panelId === 'left-bottom')!;
    expect(leftBottom.y).toBe(10);
    expect(leftBottom.x).toBe(0);
    expect(leftBottom.height).toBe(10);
    // left-bottom uses available width (100 - 60 = 40)
    expect(leftBottom.width).toBe(40);
  });

  it('resolves DEFAULT_WORKSPACE_LAYOUT for 120x40', () => {
    const panels = resolveLayout(DEFAULT_WORKSPACE_LAYOUT, 120, 40);

    // 6 panels in rows + 1 bottomBar = 7
    expect(panels).toHaveLength(7);

    const panelIds = panels.map((p) => p.panelId);
    expect(panelIds).toContain('git-status');
    expect(panelIds).toContain('commits');
    expect(panelIds).toContain('file-tree');
    expect(panelIds).toContain('tasks');
    expect(panelIds).toContain('preview');
    expect(panelIds).toContain('branches');
    expect(panelIds).toContain('command-log');

    // Bottom bar at the bottom
    const cmdLog = panels.find((p) => p.panelId === 'command-log')!;
    expect(cmdLog.y).toBe(34); // 40 - 6
    expect(cmdLog.height).toBe(6);
    expect(cmdLog.width).toBe(120);

    // Preview should span 2 rows
    const preview = panels.find((p) => p.panelId === 'preview')!;
    const fileTree = panels.find((p) => p.panelId === 'file-tree')!;
    const tasks = panels.find((p) => p.panelId === 'tasks')!;
    expect(preview.height).toBe(fileTree.height + panels.find((p) => p.panelId === 'branches')!.height);
  });

  it('panel widths sum to terminal width per row', () => {
    const panels = resolveLayout(DEFAULT_WORKSPACE_LAYOUT, 120, 40);
    // First row: git-status + commits should sum to 120
    const row1 = panels.filter((p) => p.y === 0 && p.panelId !== 'command-log');
    const row1Width = row1.reduce((sum, p) => sum + p.width, 0);
    expect(row1Width).toBe(120);
  });
});

describe('adjustSplit', () => {
  const config: LayoutConfig = {
    rows: [
      {
        height: '50%',
        columns: [
          { panelId: 'left', width: '40%' },
          { panelId: 'right', width: '60%' },
        ],
      },
      {
        height: '50%',
        columns: [
          { panelId: 'bottom', width: '100%' },
        ],
      },
    ],
  };

  it('adjusts vertical split wider', () => {
    const result = adjustSplit(config, 'left', 'v', 10);
    expect(parseFloat(result.rows[0].columns[0].width)).toBe(50);
    expect(parseFloat(result.rows[0].columns[1].width)).toBe(50);
  });

  it('adjusts vertical split narrower', () => {
    const result = adjustSplit(config, 'left', 'v', -10);
    expect(parseFloat(result.rows[0].columns[0].width)).toBe(30);
    expect(parseFloat(result.rows[0].columns[1].width)).toBe(70);
  });

  it('clamps vertical split to 15% minimum', () => {
    const result = adjustSplit(config, 'left', 'v', -30);
    expect(parseFloat(result.rows[0].columns[0].width)).toBe(15);
    expect(parseFloat(result.rows[0].columns[1].width)).toBe(85);
  });

  it('clamps neighbor to 15% minimum', () => {
    const result = adjustSplit(config, 'left', 'v', 50);
    expect(parseFloat(result.rows[0].columns[1].width)).toBe(15);
    expect(parseFloat(result.rows[0].columns[0].width)).toBe(85);
  });

  it('adjusts horizontal split', () => {
    const result = adjustSplit(config, 'left', 'h', 10);
    expect(parseFloat(result.rows[0].height)).toBe(60);
    expect(parseFloat(result.rows[1].height)).toBe(40);
  });

  it('clamps horizontal split to 15% minimum', () => {
    // Use 'left' (row 0) which has 'bottom' (row 1) as neighbor
    const result = adjustSplit(config, 'left', 'h', -40);
    expect(parseFloat(result.rows[0].height)).toBe(15);
    expect(parseFloat(result.rows[1].height)).toBe(85);
  });

  it('does not modify original config', () => {
    adjustSplit(config, 'left', 'v', 10);
    expect(parseFloat(config.rows[0].columns[0].width)).toBe(40);
    expect(parseFloat(config.rows[0].columns[1].width)).toBe(60);
  });
});
