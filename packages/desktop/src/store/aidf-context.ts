import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** An AIDF context file entry. */
export interface AidfFile {
  path: string;
  name: string;
  type: 'role' | 'task' | 'plan' | 'agent' | 'other';
  enabled: boolean;
}

/** AIDF context state per workspace. */
export interface AidfWorkspaceContext {
  workspaceId: string;
  files: AidfFile[];
  additionalFiles: string[];
  activeRole: string | null;
  activeTask: string | null;
  activePlan: string | null;
}

/** AIDF context store state. */
export interface AidfContextState {
  contexts: Record<string, AidfWorkspaceContext>;
}

/** AIDF context store actions. */
export interface AidfContextActions {
  /** Set the detected AIDF files for a workspace. */
  setFiles: (workspaceId: string, files: AidfFile[]) => void;
  /** Toggle a file's enabled state. */
  toggleFile: (workspaceId: string, filePath: string) => void;
  /** Add a non-AIDF file to context. */
  addFile: (workspaceId: string, filePath: string) => void;
  /** Remove a non-AIDF file from context. */
  removeFile: (workspaceId: string, filePath: string) => void;
  /** Set the active role. */
  setActiveRole: (workspaceId: string, role: string | null) => void;
  /** Set the active task. */
  setActiveTask: (workspaceId: string, task: string | null) => void;
  /** Set the active plan. */
  setActivePlan: (workspaceId: string, plan: string | null) => void;
  /** Get context for a workspace (creates empty if missing). */
  getContext: (workspaceId: string) => AidfWorkspaceContext;
  /** Get a summary string for the context badge. */
  getContextSummary: (workspaceId: string) => string;
}

/** Combined store type. */
export type AidfContextStore = AidfContextState & AidfContextActions;

const emptyContext = (workspaceId: string): AidfWorkspaceContext => ({
  workspaceId,
  files: [],
  additionalFiles: [],
  activeRole: null,
  activeTask: null,
  activePlan: null,
});

/** Zustand store for AIDF context management per workspace. */
export const useAidfContextStore = create<AidfContextStore>()(
  persist(
    (set, get) => ({
      contexts: {},

      setFiles: (workspaceId, files) => {
        set((state) => ({
          contexts: {
            ...state.contexts,
            [workspaceId]: {
              ...(state.contexts[workspaceId] ?? emptyContext(workspaceId)),
              files,
            },
          },
        }));
      },

      toggleFile: (workspaceId, filePath) => {
        set((state) => {
          const ctx = state.contexts[workspaceId] ?? emptyContext(workspaceId);
          return {
            contexts: {
              ...state.contexts,
              [workspaceId]: {
                ...ctx,
                files: ctx.files.map((f) =>
                  f.path === filePath ? { ...f, enabled: !f.enabled } : f,
                ),
              },
            },
          };
        });
      },

      addFile: (workspaceId, filePath) => {
        set((state) => {
          const ctx = state.contexts[workspaceId] ?? emptyContext(workspaceId);
          if (ctx.additionalFiles.includes(filePath)) return state;
          return {
            contexts: {
              ...state.contexts,
              [workspaceId]: {
                ...ctx,
                additionalFiles: [...ctx.additionalFiles, filePath],
              },
            },
          };
        });
      },

      removeFile: (workspaceId, filePath) => {
        set((state) => {
          const ctx = state.contexts[workspaceId] ?? emptyContext(workspaceId);
          return {
            contexts: {
              ...state.contexts,
              [workspaceId]: {
                ...ctx,
                additionalFiles: ctx.additionalFiles.filter((f) => f !== filePath),
              },
            },
          };
        });
      },

      setActiveRole: (workspaceId, role) => {
        set((state) => ({
          contexts: {
            ...state.contexts,
            [workspaceId]: {
              ...(state.contexts[workspaceId] ?? emptyContext(workspaceId)),
              activeRole: role,
            },
          },
        }));
      },

      setActiveTask: (workspaceId, task) => {
        set((state) => ({
          contexts: {
            ...state.contexts,
            [workspaceId]: {
              ...(state.contexts[workspaceId] ?? emptyContext(workspaceId)),
              activeTask: task,
            },
          },
        }));
      },

      setActivePlan: (workspaceId, plan) => {
        set((state) => ({
          contexts: {
            ...state.contexts,
            [workspaceId]: {
              ...(state.contexts[workspaceId] ?? emptyContext(workspaceId)),
              activePlan: plan,
            },
          },
        }));
      },

      getContext: (workspaceId) => {
        return get().contexts[workspaceId] ?? emptyContext(workspaceId);
      },

      getContextSummary: (workspaceId) => {
        const ctx = get().contexts[workspaceId];
        if (!ctx) return 'No context';
        const enabledFiles = ctx.files.filter((f) => f.enabled).length + ctx.additionalFiles.length;
        const parts: string[] = [];
        if (enabledFiles > 0) parts.push(`${enabledFiles} files`);
        if (ctx.activeRole) parts.push('1 role');
        if (ctx.activeTask) parts.push('1 task');
        if (ctx.activePlan) parts.push('1 plan');
        return parts.length > 0 ? parts.join(', ') : 'No context';
      },
    }),
    {
      name: 'ditloop-aidf-context-store',
      partialize: (state) => ({ contexts: state.contexts }),
    },
  ),
);
