import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { ExecutionSession } from './execution-session.js';
import { EventBus } from '../events/index.js';

describe('ExecutionSession', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-session-test-'));
    eventBus = new EventBus();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function createSession() {
    return new ExecutionSession({
      taskId: 'task-001',
      workspace: 'test-ws',
      eventBus,
      sessionsDir: tempDir,
    });
  }

  it('creates a session with unique ID', () => {
    const session = createSession();
    expect(session.id).toBeTruthy();
    expect(session.taskId).toBe('task-001');
    expect(session.workspace).toBe('test-ws');
    expect(session.status).toBe('active');
  });

  it('adds messages to conversation history', () => {
    const session = createSession();
    session.addMessage({ role: 'user', content: 'Hello' });
    session.addMessage({ role: 'assistant', content: 'Hi!' });

    expect(session.messages).toHaveLength(2);
    expect(session.messages[0].content).toBe('Hello');
  });

  describe('action lifecycle', () => {
    it('proposes, approves, and marks executed', () => {
      const session = createSession();
      const tracked = session.proposeAction({
        type: 'file_create',
        path: 'new.ts',
        content: 'test',
      });

      expect(tracked.status).toBe('proposed');
      expect(session.actions).toHaveLength(1);

      session.approveAction(tracked.id);
      expect(session.actions[0].status).toBe('approved');

      session.markExecuted(tracked.id, 'success');
      expect(session.actions[0].status).toBe('executed');
    });

    it('proposes and rejects action', () => {
      const session = createSession();
      const tracked = session.proposeAction({
        type: 'shell_command',
        command: 'rm -rf /',
      });

      session.rejectAction(tracked.id, 'Too dangerous');
      expect(session.actions[0].status).toBe('rejected');
      expect(session.actions[0].result).toBe('Too dangerous');
    });

    it('marks action as failed', () => {
      const session = createSession();
      const tracked = session.proposeAction({
        type: 'shell_command',
        command: 'npm test',
      });

      session.approveAction(tracked.id);
      session.markFailed(tracked.id, 'Command failed');
      expect(session.actions[0].status).toBe('failed');
    });

    it('throws when approving non-proposed action', () => {
      const session = createSession();
      const tracked = session.proposeAction({
        type: 'file_create',
        path: 'test.ts',
        content: '',
      });

      session.approveAction(tracked.id);
      expect(() => session.approveAction(tracked.id)).toThrow('not in proposed state');
    });

    it('throws for unknown action ID', () => {
      const session = createSession();
      expect(() => session.approveAction('unknown')).toThrow('not found');
    });
  });

  describe('session lifecycle', () => {
    it('pauses and resumes', () => {
      const session = createSession();
      session.pause();
      expect(session.status).toBe('paused');

      session.resume();
      expect(session.status).toBe('active');
    });

    it('throws when resuming non-paused session', () => {
      const session = createSession();
      expect(() => session.resume()).toThrow('Cannot resume');
    });

    it('completes session', () => {
      const session = createSession();
      session.complete();
      expect(session.status).toBe('completed');
    });

    it('fails session', () => {
      const session = createSession();
      session.fail();
      expect(session.status).toBe('failed');
    });
  });

  describe('persistence', () => {
    it('saves and loads session', async () => {
      const session = createSession();
      session.addMessage({ role: 'user', content: 'Hello' });
      session.proposeAction({ type: 'file_create', path: 'test.ts', content: 'data' });

      await session.save();

      const loaded = await ExecutionSession.load(session.id, {
        eventBus,
        sessionsDir: tempDir,
      });

      expect(loaded).toBeDefined();
      expect(loaded!.id).toBe(session.id);
      expect(loaded!.taskId).toBe('task-001');
      expect(loaded!.messages).toHaveLength(1);
      expect(loaded!.actions).toHaveLength(1);
    });

    it('returns undefined for non-existent session', async () => {
      const loaded = await ExecutionSession.load('nonexistent', {
        sessionsDir: tempDir,
      });

      expect(loaded).toBeUndefined();
    });
  });

  describe('event emission', () => {
    it('emits approval:requested on proposeAction', () => {
      const events: unknown[] = [];
      eventBus.on('approval:requested', (e) => events.push(e));

      const session = createSession();
      session.proposeAction({ type: 'file_create', path: 'test.ts', content: '' });

      expect(events).toHaveLength(1);
    });

    it('emits approval:granted on approveAction', () => {
      const events: unknown[] = [];
      eventBus.on('approval:granted', (e) => events.push(e));

      const session = createSession();
      const tracked = session.proposeAction({ type: 'file_create', path: 'test.ts', content: '' });
      session.approveAction(tracked.id);

      expect(events).toHaveLength(1);
    });

    it('emits approval:denied on rejectAction', () => {
      const events: unknown[] = [];
      eventBus.on('approval:denied', (e) => events.push(e));

      const session = createSession();
      const tracked = session.proposeAction({ type: 'file_create', path: 'test.ts', content: '' });
      session.rejectAction(tracked.id, 'no');

      expect(events).toHaveLength(1);
    });
  });
});
