import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionStore } from './connection.js';

describe('useConnectionStore', () => {
  beforeEach(() => {
    useConnectionStore.getState().disconnect();
  });

  it('has correct initial state', () => {
    const state = useConnectionStore.getState();
    expect(state.serverUrl).toBe('');
    expect(state.token).toBe('');
    expect(state.status).toBe('disconnected');
    expect(state.error).toBeNull();
    expect(state.configured).toBe(false);
  });

  it('configure() sets URL, token, and configured flag', () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'my-token');
    const state = useConnectionStore.getState();
    expect(state.serverUrl).toBe('http://localhost:4321');
    expect(state.token).toBe('my-token');
    expect(state.configured).toBe(true);
    expect(state.status).toBe('disconnected');
  });

  it('configure() strips trailing slashes from URL', () => {
    useConnectionStore.getState().configure('http://localhost:4321///', 'tok');
    expect(useConnectionStore.getState().serverUrl).toBe('http://localhost:4321');
  });

  it('disconnect() resets to initial state', () => {
    useConnectionStore.getState().configure('http://localhost:4321', 'tok');
    useConnectionStore.getState().disconnect();
    const state = useConnectionStore.getState();
    expect(state.serverUrl).toBe('');
    expect(state.token).toBe('');
    expect(state.configured).toBe(false);
    expect(state.status).toBe('disconnected');
  });

  it('setStatus() updates status and error', () => {
    useConnectionStore.getState().setStatus('error', 'Connection failed');
    const state = useConnectionStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Connection failed');
  });

  it('setStatus() clears error when not provided', () => {
    useConnectionStore.getState().setStatus('error', 'Some error');
    useConnectionStore.getState().setStatus('connected');
    expect(useConnectionStore.getState().error).toBeNull();
  });
});
