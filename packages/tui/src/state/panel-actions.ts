import { create } from 'zustand';

/** Actions that can be dispatched to a focused panel. */
export type PanelAction = 'scroll-up' | 'scroll-down' | 'activate' | 'toggle-expand';

/** A dispatched panel action with timestamp for effect triggering. */
export interface PanelActionEvent {
  panelId: string;
  action: PanelAction;
  ts: number;
}

/** State for the panel action dispatch store. */
export interface PanelActionState {
  /** Last dispatched action with timestamp to trigger effects. */
  lastAction: PanelActionEvent | null;
  /** Dispatch an action to a specific panel. */
  dispatch: (panelId: string, action: PanelAction) => void;
}

/**
 * Zustand store for dispatching keyboard actions to individual panels.
 * The WorkspacePanelsView subscribes to lastAction and routes to the correct panel hook.
 */
export const usePanelActionStore = create<PanelActionState>((set) => ({
  lastAction: null,
  dispatch: (panelId, action) =>
    set({ lastAction: { panelId, action, ts: Date.now() } }),
}));
