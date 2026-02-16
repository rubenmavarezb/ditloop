import { describe, it, expect, beforeEach } from 'vitest';
import { useLayoutStore, RESIZE_STEP } from './layout-store.js';
import { DEFAULT_WORKSPACE_LAYOUT } from '@ditloop/ui';

describe('useLayoutStore', () => {
  beforeEach(() => {
    useLayoutStore.setState({
      layoutConfig: DEFAULT_WORKSPACE_LAYOUT,
      isDirty: false,
    });
  });

  it('starts with default layout', () => {
    const state = useLayoutStore.getState();
    expect(state.layoutConfig).toEqual(DEFAULT_WORKSPACE_LAYOUT);
    expect(state.isDirty).toBe(false);
  });

  it('resizePanel updates layout and marks dirty', () => {
    const { resizePanel } = useLayoutStore.getState();
    resizePanel('git-status', 'v', RESIZE_STEP);
    const state = useLayoutStore.getState();
    expect(state.isDirty).toBe(true);
  });

  it('resetLayout restores default', () => {
    const { resizePanel, resetLayout } = useLayoutStore.getState();
    resizePanel('git-status', 'v', RESIZE_STEP);
    resetLayout();
    const state = useLayoutStore.getState();
    expect(state.layoutConfig).toEqual(DEFAULT_WORKSPACE_LAYOUT);
    expect(state.isDirty).toBe(false);
  });

  it('loadLayout applies a custom layout', () => {
    const customLayout = {
      rows: [
        {
          heightPercent: 100,
          columns: [{ panelId: 'single', widthPercent: 100 }],
        },
      ],
    };
    const { loadLayout } = useLayoutStore.getState();
    loadLayout(customLayout);
    const state = useLayoutStore.getState();
    expect(state.layoutConfig.rows).toHaveLength(1);
    expect(state.isDirty).toBe(false);
  });

  it('RESIZE_STEP is 5', () => {
    expect(RESIZE_STEP).toBe(5);
  });
});
