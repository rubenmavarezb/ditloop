import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeAdapter } from './claude-adapter.js';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        stream: vi.fn().mockImplementation(() => {
          // Return an async iterable of SSE-like events
          const events = [
            { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
            { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello ' } },
            { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'world!' } },
            { type: 'content_block_stop', index: 0 },
            { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 5 } },
            { type: 'message_stop' },
          ];

          return {
            [Symbol.asyncIterator]: async function* () {
              for (const event of events) {
                yield event;
              }
            },
          };
        }),
      },
    })),
  };
});

describe('ClaudeAdapter', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  });

  it('throws without API key', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    expect(() => new ClaudeAdapter({ apiKey: '' })).toThrow('Anthropic API key required');
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  });

  it('creates with API key from options', () => {
    const adapter = new ClaudeAdapter({ apiKey: 'my-key' });
    expect(adapter.name).toBe('claude');
  });

  it('creates with API key from env', () => {
    const adapter = new ClaudeAdapter();
    expect(adapter.name).toBe('claude');
  });

  it('streams text response', async () => {
    const adapter = new ClaudeAdapter({ apiKey: 'test-key' });
    const chunks: unknown[] = [];

    for await (const chunk of adapter.sendMessage({
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toContainEqual({ type: 'delta', content: 'Hello ' });
    expect(chunks).toContainEqual({ type: 'delta', content: 'world!' });
    expect(chunks).toContainEqual({ type: 'done', stopReason: 'end_turn' });
  });

  it('returns model list', async () => {
    const adapter = new ClaudeAdapter({ apiKey: 'test-key' });
    const models = await adapter.listModels();

    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.id.includes('claude'))).toBe(true);
  });

  it('returns capabilities', () => {
    const adapter = new ClaudeAdapter({ apiKey: 'test-key' });
    const caps = adapter.getCapabilities();

    expect(caps.streaming).toBe(true);
    expect(caps.toolUse).toBe(true);
    expect(caps.vision).toBe(true);
    expect(caps.maxContextTokens).toBeGreaterThan(0);
  });
});

describe('ClaudeAdapter tool use', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  });

  it('handles tool use blocks', async () => {
    // Re-mock with tool use events
    const { default: MockAnthropic } = await import('@anthropic-ai/sdk');
    (MockAnthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      messages: {
        stream: vi.fn().mockImplementation(() => ({
          [Symbol.asyncIterator]: async function* () {
            yield { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'call_1', name: 'read_file' } };
            yield { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"path":' } };
            yield { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: ' "src/index.ts"}' } };
            yield { type: 'content_block_stop', index: 0 };
            yield { type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 10 } };
          },
        })),
      },
    }));

    const adapter = new ClaudeAdapter({ apiKey: 'test-key' });
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
