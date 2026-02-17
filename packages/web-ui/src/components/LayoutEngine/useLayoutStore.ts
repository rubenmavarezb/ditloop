import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PanelState } from './panel-registry.js';
import { layoutPresets, DEFAULT_PRESET, type LayoutPresetId } from './presets.js';

/** Layout store state. */
export interface LayoutState {
  /** Currently active preset ID. */
  preset: LayoutPresetId;
  /** Per-panel visibility and size state. */
  panels: Record<string, PanelState>;
  /** Whether a panel is currently being resized. */
  resizing: boolean;
}

/** Layout store actions. */
export interface LayoutActions {
  /** Switch to a layout preset. */
  setPreset: (id: LayoutPresetId) => void;
  /** Toggle a panel's visibility. */
  togglePanel: (panelId: string) => void;
  /** Set a panel's size (during drag resize). */
  setPanelSize: (panelId: string, size: number) => void;
  /** Set resizing state (for cursor and transition control). */
  setResizing: (resizing: boolean) => void;
  /** Show a specific panel. */
  showPanel: (panelId: string) => void;
  /** Hide a specific panel. */
  hidePanel: (panelId: string) => void;
}

/** Combined layout store type. */
export type LayoutStore = LayoutState & LayoutActions;

/**
 * Zustand store for the IDE layout state.
 * Persisted to localStorage so layout survives app restarts.
 */
export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      preset: DEFAULT_PRESET,
      panels: { ...layoutPresets[DEFAULT_PRESET].panels },
      resizing: false,

      setPreset: (id) => {
        const preset = layoutPresets[id];
        if (!preset) return;
        set({ preset: id, panels: { ...preset.panels } });
      },

      togglePanel: (panelId) =>
        set((state) => {
          const panel = state.panels[panelId];
          if (!panel) return state;
          return {
            panels: {
              ...state.panels,
              [panelId]: { ...panel, visible: !panel.visible },
            },
          };
        }),

      setPanelSize: (panelId, size) =>
        set((state) => {
          const panel = state.panels[panelId];
          if (!panel) return state;
          return {
            panels: {
              ...state.panels,
              [panelId]: { ...panel, size },
            },
          };
        }),

      setResizing: (resizing) => set({ resizing }),

      showPanel: (panelId) =>
        set((state) => {
          const panel = state.panels[panelId];
          if (!panel) return state;
          return {
            panels: {
              ...state.panels,
              [panelId]: { ...panel, visible: true },
            },
          };
        }),

      hidePanel: (panelId) =>
        set((state) => {
          const panel = state.panels[panelId];
          if (!panel) return state;
          return {
            panels: {
              ...state.panels,
              [panelId]: { ...panel, visible: false },
            },
          };
        }),
    }),
    {
      name: 'ditloop-layout',
      partialize: (state) => ({
        preset: state.preset,
        panels: state.panels,
      }),
    },
  ),
);
