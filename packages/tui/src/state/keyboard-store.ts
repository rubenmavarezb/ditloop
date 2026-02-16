import { create } from 'zustand';

/** Keyboard input modes. */
export type KeyMode = 'normal' | 'search' | 'command';

/** A registered key binding. */
export interface KeyBinding {
  /** Key identifier (e.g., 'j', 'k', 'enter', 'tab'). */
  key: string;
  /** Which mode this binding is active in. */
  mode: KeyMode;
  /** If set, only active when this panel is focused. */
  panelId?: string;
  /** Action identifier for dispatching. */
  action: string;
  /** Human-readable description for help overlay. */
  description: string;
}

/** Keyboard state and actions. */
export interface KeyboardState {
  /** Current keyboard input mode. */
  mode: KeyMode;
  /** ID of the currently focused panel. */
  focusedPanelId: string;
  /** Ordered list of panel IDs for focus cycling. */
  panelOrder: string[];
  /** All registered key bindings. */
  bindings: KeyBinding[];
  /** Whether the help overlay is visible. */
  helpVisible: boolean;

  /** Set the current keyboard mode. */
  setMode: (mode: KeyMode) => void;
  /** Set focus to a specific panel by ID. */
  setFocus: (panelId: string) => void;
  /** Set the ordered list of panel IDs. */
  setPanelOrder: (order: string[]) => void;
  /** Move focus to the next panel in order, wrapping around. */
  focusNext: () => void;
  /** Move focus to the previous panel in order, wrapping around. */
  focusPrev: () => void;
  /** Focus the panel at a 1-based numeric index in panelOrder. */
  focusByNumber: (num: number) => void;
  /** Move focus left (alias for focusPrev). */
  focusLeft: () => void;
  /** Move focus right (alias for focusNext). */
  focusRight: () => void;
  /** Register key bindings (typically on panel mount). */
  registerBindings: (bindings: KeyBinding[]) => void;
  /** Remove all bindings for a given panel ID (typically on panel unmount). */
  unregisterBindings: (panelId: string) => void;
  /** Toggle help overlay visibility. */
  toggleHelp: () => void;
  /**
   * Return bindings matching the current mode that are either global
   * (no panelId) or scoped to the currently focused panel.
   */
  getActiveBindings: () => KeyBinding[];
}

/**
 * Zustand store for centralized keyboard mode, panel focus, and key bindings.
 */
export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  mode: 'normal',
  focusedPanelId: '',
  panelOrder: [],
  bindings: [],
  helpVisible: false,

  setMode: (mode) => set({ mode }),

  setFocus: (panelId) => set({ focusedPanelId: panelId }),

  setPanelOrder: (order) =>
    set((state) => ({
      panelOrder: order,
      focusedPanelId:
        state.focusedPanelId && order.includes(state.focusedPanelId)
          ? state.focusedPanelId
          : order[0] ?? '',
    })),

  focusNext: () =>
    set((state) => {
      const { panelOrder, focusedPanelId } = state;
      if (panelOrder.length === 0) return state;
      const idx = panelOrder.indexOf(focusedPanelId);
      const next = (idx + 1) % panelOrder.length;
      return { focusedPanelId: panelOrder[next] };
    }),

  focusPrev: () =>
    set((state) => {
      const { panelOrder, focusedPanelId } = state;
      if (panelOrder.length === 0) return state;
      const idx = panelOrder.indexOf(focusedPanelId);
      const prev = (idx - 1 + panelOrder.length) % panelOrder.length;
      return { focusedPanelId: panelOrder[prev] };
    }),

  focusByNumber: (num) =>
    set((state) => {
      const idx = num - 1;
      if (idx < 0 || idx >= state.panelOrder.length) return state;
      return { focusedPanelId: state.panelOrder[idx] };
    }),

  focusLeft: () => get().focusPrev(),

  focusRight: () => get().focusNext(),

  registerBindings: (newBindings) =>
    set((state) => ({ bindings: [...state.bindings, ...newBindings] })),

  unregisterBindings: (panelId) =>
    set((state) => ({
      bindings: state.bindings.filter((b) => b.panelId !== panelId),
    })),

  toggleHelp: () => set((state) => ({ helpVisible: !state.helpVisible })),

  getActiveBindings: () => {
    const { mode, focusedPanelId, bindings } = get();
    return bindings.filter(
      (b) =>
        b.mode === mode &&
        (b.panelId === undefined || b.panelId === focusedPanelId),
    );
  },
}));
