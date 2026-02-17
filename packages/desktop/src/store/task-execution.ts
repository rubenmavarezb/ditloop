import { create } from 'zustand';

/** Task execution step. */
export interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  timestamp?: number;
}

/** Agent log entry. */
export interface AgentLogEntry {
  timestamp: number;
  agent: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

/** Proposed file change for approval. */
export interface ProposedChange {
  filePath: string;
  diff: string;
  additions: number;
  deletions: number;
}

/** A running AI task. */
export interface AiTask {
  id: string;
  title: string;
  workspaceId: string;
  provider: string;
  model: string;
  status: 'running' | 'paused' | 'awaiting-approval' | 'done' | 'failed';
  steps: TaskStep[];
  logs: AgentLogEntry[];
  proposedChanges: ProposedChange[];
  aidfTaskRef: string | null;
  startedAt: number;
  elapsedMs: number;
}

/** Task execution store state. */
export interface TaskExecutionState {
  tasks: Record<string, AiTask>;
  activeTaskId: string | null;
}

/** Task execution store actions. */
export interface TaskExecutionActions {
  /** Create a new task. */
  createTask: (task: Omit<AiTask, 'logs' | 'proposedChanges' | 'elapsedMs'>) => void;
  /** Update step status. */
  updateStep: (taskId: string, stepId: string, status: TaskStep['status']) => void;
  /** Add a log entry. */
  addLog: (taskId: string, entry: Omit<AgentLogEntry, 'timestamp'>) => void;
  /** Set proposed changes for approval. */
  setProposedChanges: (taskId: string, changes: ProposedChange[]) => void;
  /** Update task status. */
  setTaskStatus: (taskId: string, status: AiTask['status']) => void;
  /** Approve proposed changes. */
  approveChanges: (taskId: string) => void;
  /** Reject proposed changes. */
  rejectChanges: (taskId: string) => void;
  /** Set the active task. */
  setActiveTask: (taskId: string | null) => void;
  /** Get task by ID. */
  getTask: (taskId: string) => AiTask | undefined;
}

/** Combined store type. */
export type TaskExecutionStore = TaskExecutionState & TaskExecutionActions;

/** Zustand store for AI task execution tracking. */
export const useTaskExecutionStore = create<TaskExecutionStore>()((set, get) => ({
  tasks: {},
  activeTaskId: null,

  createTask: (task) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [task.id]: { ...task, logs: [], proposedChanges: [], elapsedMs: 0 },
      },
      activeTaskId: task.id,
    }));
  },

  updateStep: (taskId, stepId, status) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            steps: task.steps.map((s) =>
              s.id === stepId ? { ...s, status, timestamp: Date.now() } : s,
            ),
          },
        },
      };
    });
  },

  addLog: (taskId, entry) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            logs: [...task.logs, { ...entry, timestamp: Date.now() }],
          },
        },
      };
    });
  },

  setProposedChanges: (taskId, changes) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            proposedChanges: changes,
            status: 'awaiting-approval',
          },
        },
      };
    });
  },

  setTaskStatus: (taskId, status) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: { ...state.tasks, [taskId]: { ...task, status } },
      };
    });
  },

  approveChanges: (taskId) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: { ...task, proposedChanges: [], status: 'running' },
        },
      };
    });
  },

  rejectChanges: (taskId) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: { ...task, proposedChanges: [], status: 'running' },
        },
      };
    });
  },

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),

  getTask: (taskId) => get().tasks[taskId],
}));
