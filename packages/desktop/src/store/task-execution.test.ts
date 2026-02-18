import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskExecutionStore } from './task-execution.js';

const mockTask = () => ({
  id: 'task-1',
  title: 'Add retry logic',
  workspaceId: 'ws1',
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
  status: 'running' as const,
  steps: [
    { id: 'step-1', label: 'Analyzing codebase', status: 'done' as const },
    { id: 'step-2', label: 'Planning changes', status: 'running' as const },
    { id: 'step-3', label: 'Applying changes', status: 'pending' as const },
  ],
  aidfTaskRef: '.ai/tasks/054-retry-logic.md',
  startedAt: Date.now(),
});

describe('TaskExecutionStore', () => {
  beforeEach(() => {
    useTaskExecutionStore.setState({ tasks: {}, activeTaskId: null });
  });

  it('creates a task', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());

    const state = useTaskExecutionStore.getState();
    expect(state.tasks['task-1']).toBeDefined();
    expect(state.tasks['task-1'].title).toBe('Add retry logic');
    expect(state.activeTaskId).toBe('task-1');
  });

  it('updates a step status', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());
    store.updateStep('task-1', 'step-2', 'done');

    const task = useTaskExecutionStore.getState().tasks['task-1'];
    expect(task.steps[1].status).toBe('done');
    expect(task.steps[1].timestamp).toBeGreaterThan(0);
  });

  it('adds log entries', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());
    store.addLog('task-1', { agent: 'ARCHITECT', message: 'Found 3 retry points', level: 'info' });

    const task = useTaskExecutionStore.getState().tasks['task-1'];
    expect(task.logs).toHaveLength(1);
    expect(task.logs[0].agent).toBe('ARCHITECT');
  });

  it('sets proposed changes and transitions to awaiting-approval', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());
    store.setProposedChanges('task-1', [
      { filePath: 'src/main.ts', diff: '+ retry()', additions: 1, deletions: 0 },
    ]);

    const task = useTaskExecutionStore.getState().tasks['task-1'];
    expect(task.status).toBe('awaiting-approval');
    expect(task.proposedChanges).toHaveLength(1);
  });

  it('approves changes and clears them', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());
    store.setProposedChanges('task-1', [
      { filePath: 'src/main.ts', diff: '+ retry()', additions: 1, deletions: 0 },
    ]);
    store.approveChanges('task-1');

    const task = useTaskExecutionStore.getState().tasks['task-1'];
    expect(task.status).toBe('running');
    expect(task.proposedChanges).toHaveLength(0);
  });

  it('rejects changes and continues running', () => {
    const store = useTaskExecutionStore.getState();
    store.createTask(mockTask());
    store.setProposedChanges('task-1', [
      { filePath: 'src/main.ts', diff: '+ retry()', additions: 1, deletions: 0 },
    ]);
    store.rejectChanges('task-1');

    const task = useTaskExecutionStore.getState().tasks['task-1'];
    expect(task.status).toBe('running');
    expect(task.proposedChanges).toHaveLength(0);
  });
});
