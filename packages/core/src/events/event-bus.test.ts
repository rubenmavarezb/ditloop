import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus, getEventBus, resetEventBus } from './event-bus.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('delivers events to registered handlers', () => {
    const handler = vi.fn();
    bus.on('workspace:activated', handler);

    const payload = { id: 'ws-1', name: 'My Project', path: '/tmp/proj' };
    bus.emit('workspace:activated', payload);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(payload);
  });

  it('supports multiple handlers for the same event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('profile:switched', h1);
    bus.on('profile:switched', h2);

    bus.emit('profile:switched', { name: 'personal', email: 'me@test.com' });

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('once() fires only once', () => {
    const handler = vi.fn();
    bus.once('execution:started', handler);

    bus.emit('execution:started', { taskId: 't-1', workspace: 'ws-1' });
    bus.emit('execution:started', { taskId: 't-2', workspace: 'ws-1' });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('off() removes a specific handler', () => {
    const handler = vi.fn();
    bus.on('git:commit', handler);
    bus.off('git:commit', handler);

    bus.emit('git:commit', { workspace: 'ws-1', hash: 'abc123', message: 'test' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('removeAllListeners() clears all handlers for an event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('chat:message-sent', h1);
    bus.on('chat:message-sent', h2);
    bus.removeAllListeners('chat:message-sent');

    bus.emit('chat:message-sent', { workspace: 'ws-1', content: 'hi', provider: 'claude' });

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('removeAllListeners() without args clears everything', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('workspace:activated', h1);
    bus.on('profile:switched', h2);
    bus.removeAllListeners();

    bus.emit('workspace:activated', { id: '1', name: 'x', path: '/x' });
    bus.emit('profile:switched', { name: 'p', email: 'e@e.com' });

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('does not cross-deliver events', () => {
    const handler = vi.fn();
    bus.on('workspace:activated', handler);

    bus.emit('workspace:deactivated', { id: '1' });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('getEventBus singleton', () => {
  beforeEach(() => {
    resetEventBus();
  });

  it('returns the same instance', () => {
    const a = getEventBus();
    const b = getEventBus();
    expect(a).toBe(b);
  });

  it('resetEventBus creates a new instance', () => {
    const a = getEventBus();
    resetEventBus();
    const b = getEventBus();
    expect(a).not.toBe(b);
  });
});
