import { describe, it, expect, vi } from 'vitest';
import { ApprovalEngine } from './approval-engine.js';
import { EventBus } from '../events/index.js';
import type { Action } from '../executor/index.js';

describe('ApprovalEngine', () => {
  function createEngine(eventBus?: EventBus) {
    return new ApprovalEngine({
      workspace: 'test-ws',
      eventBus,
    });
  }

  const testActions: Action[] = [
    { type: 'file_create', path: 'new.ts', content: 'test' },
    { type: 'shell_command', command: 'npm test' },
  ];

  it('queues actions for review', () => {
    const engine = createEngine();
    engine.requestApproval(testActions);

    expect(engine.pendingActions).toHaveLength(2);
    expect(engine.pendingActions[0].status).toBe('pending');
  });

  it('resolves when all actions are approved', async () => {
    const engine = createEngine();
    const resultPromise = engine.requestApproval(testActions);

    const actions = engine.pendingActions;
    engine.approveOne(actions[0].id);
    engine.approveOne(actions[1].id);

    const result = await resultPromise;
    expect(result.approved).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
  });

  it('resolves when all actions are rejected', async () => {
    const engine = createEngine();
    const resultPromise = engine.requestApproval(testActions);

    const actions = engine.pendingActions;
    engine.reject(actions[0].id, 'Not needed');
    engine.reject(actions[1].id);

    const result = await resultPromise;
    expect(result.approved).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
  });

  it('resolves with mixed approvals and rejections', async () => {
    const engine = createEngine();
    const resultPromise = engine.requestApproval(testActions);

    const actions = engine.pendingActions;
    engine.approveOne(actions[0].id);
    engine.reject(actions[1].id);

    const result = await resultPromise;
    expect(result.approved).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
  });

  it('supports approveAll', async () => {
    const engine = createEngine();
    const resultPromise = engine.requestApproval(testActions);

    engine.approveAll();

    const result = await resultPromise;
    expect(result.approved).toHaveLength(2);
  });

  it('handles edit mode', async () => {
    const engine = createEngine();
    const resultPromise = engine.requestApproval(testActions);

    const actions = engine.pendingActions;
    const editedAction: Action = { type: 'file_create', path: 'edited.ts', content: 'edited' };
    engine.edit(actions[0].id, editedAction);
    engine.approveOne(actions[1].id);

    const result = await resultPromise;
    expect(result.approved).toHaveLength(2);
    expect(result.approved[0].editedAction).toEqual(editedAction);
  });

  it('throws for unknown action ID', () => {
    const engine = createEngine();
    engine.requestApproval(testActions);

    expect(() => engine.approveOne('unknown')).toThrow('not found');
  });

  it('emits events on approval flow', async () => {
    const eventBus = new EventBus();
    const requested = vi.fn();
    const granted = vi.fn();
    const denied = vi.fn();

    eventBus.on('approval:requested', requested);
    eventBus.on('approval:granted', granted);
    eventBus.on('approval:denied', denied);

    const engine = createEngine(eventBus);
    const resultPromise = engine.requestApproval(testActions);

    expect(requested).toHaveBeenCalledTimes(2);

    const actions = engine.pendingActions;
    engine.approveOne(actions[0].id);
    engine.reject(actions[1].id, 'nope');

    await resultPromise;

    expect(granted).toHaveBeenCalledTimes(1);
    expect(denied).toHaveBeenCalledTimes(1);
  });

  it('resolves immediately for empty action list', async () => {
    const engine = createEngine();
    const result = await engine.requestApproval([]);

    expect(result.approved).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
  });
});
