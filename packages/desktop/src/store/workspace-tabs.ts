import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** A workspace tab represents an open workspace context. */
export interface WorkspaceTab {
  /** Workspace ID from config. */
  id: string;
  /** Display name. */
  name: string;
  /** Filesystem path. */
  path: string;
  /** Git profile name. */
  profile: string;
  /** Current git branch. */
  branch?: string;
  /** Status color: green = clean, yellow = changes, red = conflict, gray = unknown. */
  statusColor: string;
}

/** Workspace tabs store state. */
export interface WorkspaceTabsState {
  /** Currently active tab ID. */
  activeTabId: string | null;
  /** Ordered list of open tabs. */
  tabs: WorkspaceTab[];
}

/** Workspace tabs store actions. */
export interface WorkspaceTabsActions {
  /** Open a workspace as a new tab (or activate if already open). */
  openTab: (tab: WorkspaceTab) => void;
  /** Close a tab by ID. */
  closeTab: (id: string) => void;
  /** Set the active tab. */
  setActiveTab: (id: string) => void;
  /** Reorder tabs (drag and drop). */
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  /** Update a tab's properties (e.g., branch name after git fetch). */
  updateTab: (id: string, updates: Partial<WorkspaceTab>) => void;
  /** Cycle to the next tab. */
  nextTab: () => void;
  /** Cycle to the previous tab. */
  prevTab: () => void;
}

/** Combined store type. */
export type WorkspaceTabsStore = WorkspaceTabsState & WorkspaceTabsActions;

/**
 * Zustand store for workspace tabs.
 * Persisted to localStorage so open tabs survive app restarts.
 */
export const useWorkspaceTabsStore = create<WorkspaceTabsStore>()(
  persist(
    (set, get) => ({
      activeTabId: null,
      tabs: [],

      openTab: (tab) =>
        set((state) => {
          const existing = state.tabs.find((t) => t.id === tab.id);
          if (existing) {
            return { activeTabId: tab.id };
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      closeTab: (id) =>
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === id);
          if (idx === -1) return state;

          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === id) {
            if (newTabs.length === 0) {
              newActiveId = null;
            } else if (idx >= newTabs.length) {
              newActiveId = newTabs[newTabs.length - 1].id;
            } else {
              newActiveId = newTabs[idx].id;
            }
          }

          return { tabs: newTabs, activeTabId: newActiveId };
        }),

      setActiveTab: (id) => set({ activeTabId: id }),

      reorderTabs: (fromIndex, toIndex) =>
        set((state) => {
          const newTabs = [...state.tabs];
          const [moved] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, moved);
          return { tabs: newTabs };
        }),

      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      nextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        const nextIdx = (idx + 1) % tabs.length;
        set({ activeTabId: tabs[nextIdx].id });
      },

      prevTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        const prevIdx = (idx - 1 + tabs.length) % tabs.length;
        set({ activeTabId: tabs[prevIdx].id });
      },
    }),
    {
      name: 'ditloop-workspace-tabs',
      partialize: (state) => ({
        activeTabId: state.activeTabId,
        tabs: state.tabs,
      }),
    },
  ),
);
