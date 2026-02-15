import { describe, it, expect } from 'vitest';
import { ProviderRegistry } from './provider-registry.js';
import type { ProviderAdapter, ProviderCapabilities, ModelInfo, SendOptions, StreamChunk } from './provider-adapter.js';

function createMockAdapter(name: string): ProviderAdapter {
  return {
    name,
    async *sendMessage(_options: SendOptions): AsyncIterable<StreamChunk> {
      yield { type: 'done', stopReason: 'end' };
    },
    async listModels(): Promise<ModelInfo[]> {
      return [{ id: 'test-model', name: 'Test Model', maxTokens: 4096 }];
    },
    getCapabilities(): ProviderCapabilities {
      return { streaming: true, toolUse: true, vision: false, maxContextTokens: 100000 };
    },
  };
}

describe('ProviderRegistry', () => {
  it('registers and retrieves a provider', () => {
    const registry = new ProviderRegistry();
    const adapter = createMockAdapter('test');

    registry.register(adapter);

    expect(registry.get('test')).toBe(adapter);
  });

  it('throws on duplicate registration', () => {
    const registry = new ProviderRegistry();
    registry.register(createMockAdapter('test'));

    expect(() => registry.register(createMockAdapter('test'))).toThrow(
      'Provider "test" is already registered',
    );
  });

  it('returns undefined for unknown provider', () => {
    const registry = new ProviderRegistry();
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('lists registered providers', () => {
    const registry = new ProviderRegistry();
    registry.register(createMockAdapter('claude'));
    registry.register(createMockAdapter('openai'));

    expect(registry.list()).toEqual(['claude', 'openai']);
  });

  it('checks if a provider exists', () => {
    const registry = new ProviderRegistry();
    registry.register(createMockAdapter('claude'));

    expect(registry.has('claude')).toBe(true);
    expect(registry.has('openai')).toBe(false);
  });

  it('removes a provider', () => {
    const registry = new ProviderRegistry();
    registry.register(createMockAdapter('test'));

    expect(registry.remove('test')).toBe(true);
    expect(registry.get('test')).toBeUndefined();
    expect(registry.remove('test')).toBe(false);
  });
});
