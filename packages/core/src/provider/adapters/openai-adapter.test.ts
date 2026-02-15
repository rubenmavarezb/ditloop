import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from './openai-adapter.js';

// Mock the OpenAI SDK
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(() => {
            const chunks = [
              { choices: [{ delta: { content: 'Hello ' }, finish_reason: null }] },
              { choices: [{ delta: { content: 'world!' }, finish_reason: null }] },
              { choices: [{ delta: {}, finish_reason: 'stop' }] },
            ];

            return {
              [Symbol.asyncIterator]: async function* () {
                for (const chunk of chunks) {
                  yield chunk;
                }
              },
            };
          }),
        },
      },
    })),
  };
});

describe('OpenAIAdapter', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  it('throws without API key', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    expect(() => new OpenAIAdapter({ apiKey: '' })).toThrow('OpenAI API key required');
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  it('creates with API key from options', () => {
    const adapter = new OpenAIAdapter({ apiKey: 'my-key' });
    expect(adapter.name).toBe('openai');
  });

  it('streams text response', async () => {
    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const chunks: unknown[] = [];

    for await (const chunk of adapter.sendMessage({
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toContainEqual({ type: 'delta', content: 'Hello ' });
    expect(chunks).toContainEqual({ type: 'delta', content: 'world!' });
    expect(chunks).toContainEqual({ type: 'done', stopReason: 'stop' });
  });

  it('returns model list', async () => {
    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const models = await adapter.listModels();

    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.id.includes('gpt'))).toBe(true);
  });

  it('returns capabilities', () => {
    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const caps = adapter.getCapabilities();

    expect(caps.streaming).toBe(true);
    expect(caps.toolUse).toBe(true);
    expect(caps.maxContextTokens).toBeGreaterThan(0);
  });
});

describe('OpenAIAdapter tool calls', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  it('handles function calling', async () => {
    const { default: MockOpenAI } = await import('openai');
    (MockOpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
              yield {
                choices: [{
                  delta: {
                    tool_calls: [{
                      index: 0,
                      id: 'call_1',
                      function: { name: 'read_file', arguments: '{"path":' },
                    }],
                  },
                  finish_reason: null,
                }],
              };
              yield {
                choices: [{
                  delta: {
                    tool_calls: [{
                      index: 0,
                      function: { arguments: ' "src/index.ts"}' },
                    }],
                  },
                  finish_reason: null,
                }],
              };
              yield {
                choices: [{ delta: {}, finish_reason: 'tool_calls' }],
              };
            },
          })),
        },
      },
    }));

    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const chunks: unknown[] = [];

    for await (const chunk of adapter.sendMessage({
      messages: [{ role: 'user', content: 'Read the file' }],
      tools: [{ name: 'read_file', description: 'Read a file', parameters: { type: 'object' } }],
    })) {
      chunks.push(chunk);
    }

    const toolChunk = chunks.find((c: unknown) => (c as { type: string }).type === 'tool_use');
    expect(toolChunk).toEqual({
      type: 'tool_use',
      toolUse: {
        id: 'call_1',
        name: 'read_file',
        arguments: { path: 'src/index.ts' },
      },
    });
  });
});
