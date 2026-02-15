import { create } from 'zustand';
import type { WorkspaceItemData } from '@ditloop/ui';

/** Available views in the TUI application. */
export type ViewName = 'home' | 'workspace-detail' | 'task-detail' | 'diff-review' | 'launcher' | 'task-editor';

/** Workspace detail data loaded on activation. */
export interface WorkspaceDetailState {
  gitStatus: { branch: string; modified: number; staged: number; untracked: number } | null;
  identityMatch: boolean | null;
  tasks: Array<{ id: string; title: string; status: string }>;
}

/** Application state managed by Zustand. */
export interface AppState {
  /** All resolved workspaces for display. */
  workspaces: WorkspaceItemData[];
  /** Currently active workspace index, or null if none. */
  activeWorkspaceIndex: number | null;
  /** Current git profile name. */
  currentProfile: string | null;
  /** Current view being displayed. */
  currentView: ViewName;
  /** Whether the app has been initialized. */
  initialized: boolean;
  /** Whether the sidebar is visible. */
  sidebarVisible: boolean;
  /** Workspace detail data, loaded after activation. */
  workspaceDetailData: WorkspaceDetailState | null;

  /** Initialize the app with workspace data. */
  init: (workspaces: WorkspaceItemData[], profile?: string) => void;
  /** Activate a workspace by index. */
  activateWorkspace: (index: number) => void;
  /** Navigate to a view. */
  navigate: (view: ViewName) => void;
  /** Toggle sidebar visibility. */
  toggleSidebar: () => void;
  /** Set current profile. */
  setProfile: (profile: string) => void;
  /** Set workspace detail data after loading. */
  setWorkspaceDetailData: (data: WorkspaceDetailState) => void;
  /** Clear workspace detail data when leaving. */
  clearWorkspaceDetailData: () => void;
}

/**
 * Create the Zustand store bridging core state to UI.
 * Holds workspaces, active workspace, profile, and navigation state.
 */
export const useAppStore = create<AppState>((set) => ({
  workspaces: [],
  activeWorkspaceIndex: null,
  currentProfile: null,
  currentView: 'home',
  initialized: false,
  sidebarVisible: true,
  workspaceDetailData: null,

  init: (workspaces, profile) =>
    set({
      workspaces,
      currentProfile: profile ?? null,
      initialized: true,
    }),

  activateWorkspace: (index) =>
    set({
      activeWorkspaceIndex: index,
      currentView: 'workspace-detail',
      workspaceDetailData: null,
    }),

  navigate: (view) => set({ currentView: view }),

  toggleSidebar: () =>
    set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  setProfile: (profile) => set({ currentProfile: profile }),

  setWorkspaceDetailData: (data) => set({ workspaceDetailData: data }),

  clearWorkspaceDetailData: () => set({ workspaceDetailData: null }),
}));
