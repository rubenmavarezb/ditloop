import Anthropic from '@anthropic-ai/sdk';
import type {
  ProviderAdapter,
  ProviderCapabilities,
  ModelInfo,
  SendOptions,
  StreamChunk,
  Message,
} from '../provider-adapter.js';

/** Options for constructing a ClaudeAdapter. */
export interface ClaudeAdapterOptions {
  apiKey?: string;
  defaultModel?: string;
}

/**
 * Provider adapter for Anthropic's Claude API.
 * Supports streaming responses and tool use.
 */
export class ClaudeAdapter implements ProviderAdapter {
  readonly name = 'claude';
  private client: Anthropic;
  private defaultModel: string;

  constructor(options?: ClaudeAdapterOptions) {
    const apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Anthropic API key required. Set ANTHROPIC_API_KEY env variable or pass apiKey option.',
      );
    }

    this.client = new Anthropic({ apiKey });
    this.defaultModel = options?.defaultModel ?? 'claude-sonnet-4-5-20250929';
  }

  /**
   * Send a message and stream the response from Claude.
   *
   * @param options - Message and configuration options
   * @returns Async iterable of stream chunks
   */
  async *sendMessage(options: SendOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const messages = this.mapMessages(options.messages);

    const params: Anthropic.MessageCreateParams = {
      model,
      max_tokens: options.maxTokens ?? 4096,
      messages,
      stream: true,
    };

    if (options.systemPrompt) {
      params.system = options.systemPrompt;
    }

    if (options.temperature !== undefined) {
      params.temperature = options.temperature;
    }

    if (options.tools?.length) {
      params.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters as Anthropic.Tool.InputSchema,
      }));
    }

    const stream = this.client.messages.stream(params, {
      signal: options.signal,
    });

    let currentToolUse: { id: string; name: string; inputJson: string } | null = null;

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          currentToolUse = {
            id: event.content_block.id,
            name: event.content_block.name,
            inputJson: '',
          };
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield { type: 'delta', content: event.delta.text };
        } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
          currentToolUse.inputJson += event.delta.partial_json;
        }
      } else if (event.type === 'content_block_stop') {
        if (currentToolUse) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(currentToolUse.inputJson) as Record<string, unknown>;
          } catch {
            // Malformed JSON from model
          }
          yield {
            type: 'tool_use',
            toolUse: {
              id: currentToolUse.id,
              name: currentToolUse.name,
              arguments: args,
            },
          };
          currentToolUse = null;
        }
      } else if (event.type === 'message_stop') {
        // Will be handled by message_delta stop_reason
      } else if (event.type === 'message_delta') {
        if (event.delta.stop_reason) {
          yield { type: 'done', stopReason: event.delta.stop_reason };
        }
      }
    }
  }

  /**
   * List available Claude models.
   *
   * @returns Array of Claude model information
   */
  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', maxTokens: 32768 },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', maxTokens: 8192 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', maxTokens: 8192 },
    ];
  }

  /**
   * Get Claude provider capabilities.
   *
   * @returns Provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      toolUse: true,
      vision: true,
      maxContextTokens: 200000,
    };
  }

  private mapMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'user' as const,
            content: [
              {
                type: 'tool_result' as const,
                tool_use_id: m.toolCallId ?? '',
                content: m.content,
              },
            ],
          };
        }
        return {
          role: m.role as 'user' | 'assistant',
          content: m.content,
        };
      });
  }
}
