import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConnectionStore } from '../store/connection.js';
import { DitLoopWebSocket } from './websocket.js';

// Mock WebSocket constructor
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.CLOSED;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();
}

vi.stubGlobal('WebSocket', MockWebSocket);

describe('DitLoopWebSocket', () => {
  let ws: DitLoopWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    useConnectionStore.getState().disconnect();
    ws = new DitLoopWebSocket();
  });

  it('connect() reads URL and token from store', () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'my-token');
    const spy = vi.spyOn(globalThis, 'WebSocket' as never);
    ws.connect();
    expect(spy).toHaveBeenCalledWith(
      'ws://localhost:4321/ws?token=my-token',
    );
    spy.mockRestore();
  });

  it('disconnect() sets intentionallyClosed and updates store status', () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'tok');
    ws.connect();
    ws.disconnect();
    expect(useConnectionStore.getState().status).toBe('disconnected');
  });

  it('onMessage() returns unsubscribe function', () => {
    const handler = vi.fn();
    const unsubscribe = ws.onMessage(handler);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('isConnected returns false when no connection', () => {
    expect(ws.isConnected).toBe(false);
  });
});
