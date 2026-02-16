import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateSyncEngine } from './state-sync-engine.js';
import { EventBus } from '@ditloop/core';
import type { OfflineEvent } from './state-sync-engine.js';

describe('StateSyncEngine', () => {
  let eventBus: EventBus;
  let engine: StateSyncEngine;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new StateSyncEngine(eventBus);
  });

  afterEach(() => {
    engine.destroy();
  });

  describe('delta recording', () => {
    it('should start at version 0', () => {
      expect(engine.getCurrentVersion()).toBe(0);
    });

    it('should record deltas from EventBus events', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'test', path: '/tmp' });

      expect(engine.getCurrentVersion()).toBe(1);
      const deltas = engine.getDeltasSince(0);
      expect(deltas).toHaveLength(1);
      expect(deltas![0].event).toBe('workspace:activated');
      expect(deltas![0].version).toBe(1);
      expect(deltas![0].data).toEqual({ id: 'ws-1', name: 'test', path: '/tmp' });
    });

    it('should increment version for each event', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'a', path: '/a' });
      eventBus.emit('workspace:activated', { id: 'ws-2', name: 'b', path: '/b' });
      eventBus.emit('execution:started', { taskId: 't-1', workspace: 'ws-1' });

      expect(engine.getCurrentVersion()).toBe(3);
    });

    it('should record deltas for all event types', () => {
      eventBus.emit('profile:switched', { name: 'personal', email: 'test@example.com' });
      eventBus.emit('approval:requested', { id: 'a-1', action: 'file:write', detail: 'write foo', workspace: 'ws-1' });

      const deltas = engine.getDeltasSince(0);
      expect(deltas).toHaveLength(2);
      expect(deltas![0].event).toBe('profile:switched');
      expect(deltas![1].event).toBe('approval:requested');
    });
  });

  describe('getDeltasSince', () => {
    it('should return empty array when no deltas exist', () => {
      expect(engine.getDeltasSince(0)).toEqual([]);
    });

    it('should return only deltas after the given version', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'a', path: '/a' });
      eventBus.emit('workspace:activated', { id: 'ws-2', name: 'b', path: '/b' });
      eventBus.emit('workspace:activated', { id: 'ws-3', name: 'c', path: '/c' });

      const deltas = engine.getDeltasSince(1);
      expect(deltas).toHaveLength(2);
      expect(deltas![0].version).toBe(2);
      expect(deltas![1].version).toBe(3);
    });

    it('should return empty array when client is up to date', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'a', path: '/a' });

      const deltas = engine.getDeltasSince(1);
      expect(deltas).toEqual([]);
    });

    it('should return undefined when version is too old (not in buffer)', () => {
      // Fill buffer beyond capacity
      for (let i = 0; i < 1001; i++) {
        eventBus.emit('workspace:activated', { id: `ws-${i}`, name: `ws-${i}`, path: `/tmp/${i}` });
      }

      // Version 0 is no longer in the buffer
      expect(engine.getDeltasSince(0)).toBeUndefined();
    });
  });

  describe('ring buffer eviction', () => {
    it('should keep at most 1000 deltas', () => {
      for (let i = 0; i < 1050; i++) {
        eventBus.emit('workspace:activated', { id: `ws-${i}`, name: `ws-${i}`, path: `/tmp/${i}` });
      }

      expect(engine.getCurrentVersion()).toBe(1050);

      // Version 50 should still be in buffer (oldest is version 51)
      const deltas = engine.getDeltasSince(50);
      expect(deltas).toHaveLength(1000);
      expect(deltas![0].version).toBe(51);
    });

    it('should evict oldest deltas first', () => {
      for (let i = 0; i < 1005; i++) {
        eventBus.emit('workspace:activated', { id: `ws-${i}`, name: `ws-${i}`, path: `/tmp/${i}` });
      }

      // Version 4 was evicted, so requesting since version 4 returns undefined
      expect(engine.getDeltasSince(4)).toBeUndefined();

      // Version 5 is the oldest in the buffer
      const deltas = engine.getDeltasSince(5);
      expect(deltas).toBeDefined();
      expect(deltas![0].version).toBe(6);
    });
  });

  describe('getFullState', () => {
    it('should return empty state initially', () => {
      const state = engine.getFullState();
      expect(state.version).toBe(0);
      expect(state.workspaces).toEqual([]);
      expect(state.executions).toEqual([]);
      expect(state.approvals).toEqual([]);
    });

    it('should accumulate workspace state', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'test', path: '/tmp/test' });
      eventBus.emit('workspace:created', { id: 'ws-2', name: 'other', path: '/tmp/other' });

      const state = engine.getFullState();
      expect(state.workspaces).toHaveLength(2);
    });

    it('should remove workspace on workspace:removed', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'test', path: '/tmp' });
      eventBus.emit('workspace:removed', { id: 'ws-1' });

      const state = engine.getFullState();
      expect(state.workspaces).toHaveLength(0);
    });

    it('should accumulate execution state', () => {
      eventBus.emit('execution:started', { taskId: 't-1', workspace: 'ws-1' });
      eventBus.emit('execution:progress', { taskId: 't-1', message: '50%', percent: 50 });

      const state = engine.getFullState();
      expect(state.executions).toHaveLength(1);
    });

    it('should track approval state transitions', () => {
      eventBus.emit('approval:requested', { id: 'a-1', action: 'file:write', detail: 'write', workspace: 'ws-1' });
      eventBus.emit('approval:granted', { id: 'a-1' });

      const state = engine.getFullState();
      expect(state.approvals).toHaveLength(1);
    });
  });

  describe('offline queue processing', () => {
    it('should accept valid offline events', () => {
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'hello', provider: 'claude' }, clientTimestamp: Date.now(), clientVersion: 0 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(1);
      expect(result.rejected).toBe(0);
      expect(result.conflicts).toHaveLength(0);
      expect(result.newVersion).toBe(1);
    });

    it('should process multiple events and increment version', () => {
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'a', provider: 'claude' }, clientTimestamp: 1, clientVersion: 0 },
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'b', provider: 'claude' }, clientTimestamp: 2, clientVersion: 1 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(2);
      expect(result.newVersion).toBe(2);
    });

    it('should apply FIFO eviction for queues exceeding 100 events', () => {
      const events: OfflineEvent[] = [];
      for (let i = 0; i < 120; i++) {
        events.push({
          clientId: 'c-1',
          event: 'chat:message-sent',
          data: { workspace: 'ws-1', content: `msg-${i}`, provider: 'claude' },
          clientTimestamp: i,
          clientVersion: i,
        });
      }

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(100);
      expect(result.rejected).toBe(20);
      expect(result.conflicts).toHaveLength(20);
      expect(result.conflicts[0].reason).toContain('FIFO eviction');
    });
  });

  describe('conflict resolution', () => {
    it('should use first-write-wins for approvals', () => {
      // Simulate an approval already granted via EventBus
      eventBus.emit('approval:requested', { id: 'a-1', action: 'file:write', detail: 'test', workspace: 'ws-1' });
      eventBus.emit('approval:granted', { id: 'a-1' });

      // Client tries to deny the same approval while offline
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'approval:denied', data: { id: 'a-1', reason: 'no' }, clientTimestamp: Date.now(), clientVersion: 0 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.rejected).toBe(1);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toContain('Already resolved');
    });

    it('should accept approval events when still pending', () => {
      eventBus.emit('approval:requested', { id: 'a-2', action: 'file:write', detail: 'test', workspace: 'ws-1' });

      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'approval:granted', data: { id: 'a-2' }, clientTimestamp: Date.now(), clientVersion: 0 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(1);
      expect(result.rejected).toBe(0);
    });

    it('should always accept chat messages (append-only)', () => {
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'hello', provider: 'claude' }, clientTimestamp: 1, clientVersion: 0 },
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'world', provider: 'claude' }, clientTimestamp: 2, clientVersion: 1 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(2);
      expect(result.rejected).toBe(0);
    });

    it('should use last-write-wins for other events', () => {
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'workspace:activated', data: { id: 'ws-1', name: 'old', path: '/old' }, clientTimestamp: 1, clientVersion: 0 },
        { clientId: 'c-1', event: 'workspace:activated', data: { id: 'ws-1', name: 'new', path: '/new' }, clientTimestamp: 2, clientVersion: 1 },
      ];

      const result = engine.processOfflineQueue(events);
      expect(result.accepted).toBe(2);

      const state = engine.getFullState();
      expect(state.workspaces).toHaveLength(1);
    });
  });

  describe('version vectors', () => {
    it('should track client versions', () => {
      expect(engine.getClientVersion('c-1')).toBe(0);

      engine.setClientVersion('c-1', 5);
      expect(engine.getClientVersion('c-1')).toBe(5);
    });

    it('should detect when client is behind', () => {
      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'a', path: '/a' });

      expect(engine.isClientBehind('c-1')).toBe(true);

      engine.setClientVersion('c-1', 1);
      expect(engine.isClientBehind('c-1')).toBe(false);
    });

    it('should update client version on offline queue processing', () => {
      const events: OfflineEvent[] = [
        { clientId: 'c-1', event: 'chat:message-sent', data: { workspace: 'ws-1', content: 'hi', provider: 'claude' }, clientTimestamp: 1, clientVersion: 0 },
      ];

      engine.processOfflineQueue(events);
      expect(engine.getClientVersion('c-1')).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should stop recording deltas after destroy', () => {
      engine.destroy();

      eventBus.emit('workspace:activated', { id: 'ws-1', name: 'a', path: '/a' });
      expect(engine.getCurrentVersion()).toBe(0);
    });
  });
});
