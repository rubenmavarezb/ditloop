/** Role of a message in a conversation. */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** A message in a conversation. */
export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
}

/** Tool definition for AI function calling. */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** A tool use request from the AI. */
export interface ToolUseRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** A chunk of a streamed response. */
export type StreamChunk =
  | { type: 'delta'; content: string }
  | { type: 'tool_use'; toolUse: ToolUseRequest }
  | { type: 'done'; stopReason: string };

/** Options for sending a message to a provider. */
export interface SendOptions {
  messages: Message[];
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: ToolDefinition[];
  signal?: AbortSignal;
}

/** Capabilities of a provider. */
export interface ProviderCapabilities {
  streaming: boolean;
  toolUse: boolean;
  vision: boolean;
  maxContextTokens: number;
}

/** Model information. */
export interface ModelInfo {
  id: string;
  name: string;
  maxTokens: number;
}

/**
 * Provider-agnostic interface for AI model integration.
 * Each provider (Claude, OpenAI, etc.) implements this interface.
 */
export interface ProviderAdapter {
  /** Unique provider name (e.g., 'claude', 'openai'). */
  readonly name: string;

  /**
   * Send a message and receive a streamed response.
   *
   * @param options - Message, model, and configuration options
   * @returns Async iterable of stream chunks
   */
  sendMessage(options: SendOptions): AsyncIterable<StreamChunk>;

  /**
   * List available models for this provider.
   *
   * @returns Array of model information
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * Get the capabilities of this provider.
   *
   * @returns Provider capabilities
   */
  getCapabilities(): ProviderCapabilities;
}
