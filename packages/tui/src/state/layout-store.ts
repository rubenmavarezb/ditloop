import { create } from 'zustand';
import type { LayoutConfig } from '@ditloop/ui';
import { adjustSplit, DEFAULT_WORKSPACE_LAYOUT } from '@ditloop/ui';

/** Layout store state and actions. */
export interface LayoutState {
  /** Current layout configuration. */
  layoutConfig: LayoutConfig;
  /** Whether the layout has been modified from default. */
  isDirty: boolean;

  /**
   * Resize the split containing a panel.
   *
   * @param panelId - The panel to resize
   * @param axis - 'h' for horizontal, 'v' for vertical
   * @param delta - Percentage change (positive = bigger, negative = smaller)
   */
  resizePanel: (panelId: string, axis: 'h' | 'v', delta: number) => void;

  /** Reset to default layout. */
  resetLayout: () => void;

  /**
   * Load a layout configuration (from persistence or other source).
   *
   * @param config - The layout to apply
   */
  loadLayout: (config: LayoutConfig) => void;
}

/** Default resize step in percentage points. */
export const RESIZE_STEP = 5;

/**
 * Zustand store for managing panel layout configuration.
 * Supports resize, reset, and load operations.
 */
export const useLayoutStore = create<LayoutState>((set) => ({
  layoutConfig: DEFAULT_WORKSPACE_LAYOUT,
  isDirty: false,

  resizePanel: (panelId, axis, delta) =>
    set((state) => {
      const newConfig = adjustSplit(state.layoutConfig, panelId, axis, delta);
      return { layoutConfig: newConfig, isDirty: true };
    }),

  resetLayout: () =>
    set({ layoutConfig: DEFAULT_WORKSPACE_LAYOUT, isDirty: false }),

  loadLayout: (config) =>
    set({ layoutConfig: config, isDirty: false }),
}));
