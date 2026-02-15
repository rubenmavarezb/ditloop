import OpenAI from 'openai';
import type {
  ProviderAdapter,
  ProviderCapabilities,
  ModelInfo,
  SendOptions,
  StreamChunk,
  Message,
} from '../provider-adapter.js';

/** Options for constructing an OpenAIAdapter. */
export interface OpenAIAdapterOptions {
  apiKey?: string;
  defaultModel?: string;
  baseURL?: string;
}

/**
 * Provider adapter for OpenAI's API.
 * Supports streaming responses and function calling.
 */
export class OpenAIAdapter implements ProviderAdapter {
  readonly name = 'openai';
  private client: OpenAI;
  private defaultModel: string;

  constructor(options?: OpenAIAdapterOptions) {
    const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API key required. Set OPENAI_API_KEY env variable or pass apiKey option.',
      );
    }

    this.client = new OpenAI({ apiKey, baseURL: options?.baseURL });
    this.defaultModel = options?.defaultModel ?? 'gpt-4o';
  }

  /**
   * Send a message and stream the response from OpenAI.
   *
   * @param options - Message and configuration options
   * @returns Async iterable of stream chunks
   */
  async *sendMessage(options: SendOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const messages = this.mapMessages(options.messages, options.systemPrompt);

    const params: OpenAI.ChatCompletionCreateParams = {
      model,
      max_tokens: options.maxTokens ?? 4096,
      messages,
      stream: true,
    };

    if (options.temperature !== undefined) {
      params.temperature = options.temperature;
    }

    if (options.tools?.length) {
      params.tools = options.tools.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const stream = await this.client.chat.completions.create(params, {
      signal: options.signal,
    });

    const toolCalls = new Map<number, { id: string; name: string; args: string }>();

    for await (const chunk of stream as AsyncIterable<OpenAI.ChatCompletionChunk>) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      // Text content
      if (delta.content) {
        yield { type: 'delta', content: delta.content };
      }

      // Tool calls
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!toolCalls.has(tc.index)) {
            toolCalls.set(tc.index, {
              id: tc.id ?? '',
              name: tc.function?.name ?? '',
              args: '',
            });
          }
          const existing = toolCalls.get(tc.index)!;
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments) existing.args += tc.function.arguments;
        }
      }

      // Check for finish
      const finishReason = chunk.choices[0]?.finish_reason;
      if (finishReason) {
        // Emit accumulated tool calls
        for (const [, tc] of toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.args) as Record<string, unknown>;
          } catch {
            // Malformed JSON from model
          }
          yield {
            type: 'tool_use',
            toolUse: { id: tc.id, name: tc.name, arguments: args },
          };
        }

        yield { type: 'done', stopReason: finishReason };
      }
    }
  }

  /**
   * List available OpenAI models.
   *
   * @returns Array of OpenAI model information
   */
  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 16384 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384 },
      { id: 'o1', name: 'o1', maxTokens: 100000 },
    ];
  }

  /**
   * Get OpenAI provider capabilities.
   *
   * @returns Provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      toolUse: true,
      vision: true,
      maxContextTokens: 128000,
    };
  }

  private mapMessages(
    messages: Message[],
    systemPrompt?: string,
  ): OpenAI.ChatCompletionMessageParam[] {
    const mapped: OpenAI.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      mapped.push({ role: 'system', content: systemPrompt });
    }

    for (const m of messages) {
      if (m.role === 'system') {
        mapped.push({ role: 'system', content: m.content });
      } else if (m.role === 'tool') {
        mapped.push({
          role: 'tool',
          content: m.content,
          tool_call_id: m.toolCallId ?? '',
        });
      } else if (m.role === 'assistant') {
        mapped.push({ role: 'assistant', content: m.content });
      } else {
        mapped.push({ role: 'user', content: m.content });
      }
    }

    return mapped;
  }
}
