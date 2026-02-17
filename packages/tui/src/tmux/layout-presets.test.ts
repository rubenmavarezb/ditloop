import { describe, it, expect, vi } from 'vitest';
import { LAYOUT_PRESETS, getLayoutShortcut, applyLayout } from './layout-presets.js';
import type { LayoutName } from './layout-presets.js';
import type { TmuxManager, PaneIds } from './tmux-manager.js';

describe('layout-presets', () => {
  it('defines all 5 layouts', () => {
    const names: LayoutName[] = ['default', 'code-focus', 'git-focus', 'multi-terminal', 'zen'];
    for (const name of names) {
      expect(LAYOUT_PRESETS[name]).toBeDefined();
      expect(LAYOUT_PRESETS[name].panes.length).toBeGreaterThan(0);
    }
  });

  it('default layout has correct sizes', () => {
    const def = LAYOUT_PRESETS.default;
    const sidebar = def.panes.find((p) => p.role === 'sidebar');
    const terminal = def.panes.find((p) => p.role === 'terminal');
    const git = def.panes.find((p) => p.role === 'git');
    expect(sidebar?.sizePercent).toBe(25);
    expect(terminal?.sizePercent).toBe(50);
    expect(git?.sizePercent).toBe(25);
  });

  it('zen layout hides sidebar and git', () => {
    const zen = LAYOUT_PRESETS.zen;
    expect(zen.panes.find((p) => p.role === 'sidebar')?.visible).toBe(false);
    expect(zen.panes.find((p) => p.role === 'git')?.visible).toBe(false);
    expect(zen.panes.find((p) => p.role === 'terminal')?.visible).toBe(true);
  });

  it('getLayoutShortcut returns correct shortcuts', () => {
    expect(getLayoutShortcut('default')).toBe('Ctrl+1');
    expect(getLayoutShortcut('zen')).toBe('Ctrl+5');
  });

  it('applyLayout resizes panes', async () => {
    const mockManager = { resizePane: vi.fn().mockResolvedValue(undefined) } as unknown as TmuxManager;
    const paneIds: PaneIds = { sidebar: '%0', terminal: '%1', git: '%2' };
    await applyLayout(mockManager, 'default', paneIds);
    expect(mockManager.resizePane).toHaveBeenCalledTimes(3);
  });
});
