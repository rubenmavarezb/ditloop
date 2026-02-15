import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketBridge } from './websocket-bridge.js';
import { EventBus } from '@ditloop/core';

describe('WebSocketBridge', () => {
  let eventBus: EventBus;
  let bridge: WebSocketBridge;

  beforeEach(() => {
    eventBus = new EventBus();
    bridge = new WebSocketBridge(eventBus, 'test-token');
  });

  it('should create with zero clients', () => {
    expect(bridge.clientCount).toBe(0);
  });

  it('should close cleanly', () => {
    bridge.close();
    expect(bridge.clientCount).toBe(0);
  });

  it('should be constructable with valid EventBus and token', () => {
    expect(bridge).toBeDefined();
  });
});
