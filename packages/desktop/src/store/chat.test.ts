import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chat.js';

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      conversations: {},
      activeProvider: 'anthropic',
      activeModel: 'claude-sonnet-4-6',
    });
  });

  it('adds a message to a workspace conversation', () => {
    const store = useChatStore.getState();
    store.addMessage('ws1', { role: 'user', content: 'Hello' });

    const state = useChatStore.getState();
    const conv = state.conversations['ws1'];
    expect(conv).toBeDefined();
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].role).toBe('user');
    expect(conv.messages[0].content).toBe('Hello');
    expect(conv.messages[0].id).toMatch(/^msg-/);
    expect(conv.messages[0].timestamp).toBeGreaterThan(0);
  });

  it('maintains separate conversations per workspace', () => {
    const store = useChatStore.getState();
    store.addMessage('ws1', { role: 'user', content: 'Hello ws1' });
    store.addMessage('ws2', { role: 'user', content: 'Hello ws2' });

    const state = useChatStore.getState();
    expect(state.conversations['ws1'].messages).toHaveLength(1);
    expect(state.conversations['ws2'].messages).toHaveLength(1);
    expect(state.conversations['ws1'].messages[0].content).toBe('Hello ws1');
    expect(state.conversations['ws2'].messages[0].content).toBe('Hello ws2');
  });

  it('appends content to the last message for streaming', () => {
    const store = useChatStore.getState();
    store.addMessage('ws1', { role: 'assistant', content: 'Hello', streaming: true });
    store.appendToLastMessage('ws1', ' world');

    const state = useChatStore.getState();
    expect(state.conversations['ws1'].messages[0].content).toBe('Hello world');
  });

  it('finishes streaming on the last message', () => {
    const store = useChatStore.getState();
    store.addMessage('ws1', { role: 'assistant', content: 'Response', streaming: true });
    store.finishStreaming('ws1');

    const state = useChatStore.getState();
    expect(state.conversations['ws1'].messages[0].streaming).toBe(false);
  });

  it('clears a workspace conversation', () => {
    const store = useChatStore.getState();
    store.addMessage('ws1', { role: 'user', content: 'Hello' });
    store.clearConversation('ws1');

    const state = useChatStore.getState();
    expect(state.conversations['ws1']).toBeUndefined();
  });

  it('switches provider and model', () => {
    const store = useChatStore.getState();
    store.setProvider('openai', 'gpt-4o');

    const state = useChatStore.getState();
    expect(state.activeProvider).toBe('openai');
    expect(state.activeModel).toBe('gpt-4o');
  });

  it('returns empty conversation for unknown workspace via getConversation', () => {
    const store = useChatStore.getState();
    const conv = store.getConversation('unknown');

    expect(conv.workspaceId).toBe('unknown');
    expect(conv.messages).toHaveLength(0);
    expect(conv.provider).toBe('anthropic');
  });
});
