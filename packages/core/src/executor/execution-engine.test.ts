import { describe, it, expect, vi } from 'vitest';
import { ExecutionEngine } from './execution-engine.js';
import type { ProviderAdapter, StreamChunk, ProviderCapabilities, ModelInfo, SendOptions } from '../provider/index.js';
import type { AidfTask } from '../aidf/index.js';
import { EventBus } from '../events/index.js';

function createMockProvider(chunks: StreamChunk[]): ProviderAdapter {
  return {
    name: 'mock',
    async *sendMessage(_options: SendOptions): AsyncIterable<StreamChunk> {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
    async listModels(): Promise<ModelInfo[]> {
      return [];
    },
    getCapabilities(): ProviderCapabilities {
      return { streaming: true, toolUse: true, vision: false, maxContextTokens: 100000 };
    },
  };
}

function createMockTask(): AidfTask {
  return {
    id: 'test-task',
    title: 'Test Task',
    status: 'pending',
    goal: 'Test the execution engine',
    scope: '### Allowed\n- src/**',
    requirements: '1. Make it work',
    dod: '- [ ] Tests pass',
    frontmatter: {},
    filePath: '/test/task.md',
  };
}

describe('ExecutionEngine', () => {
  it('executes a task with text response', async () => {
    const provider = createMockProvider([
      { type: 'delta', content: 'Hello ' },
      { type: 'delta', content: 'world!' },
      { type: 'done', stopReason: 'end' },
    ]);

    const engine = new ExecutionEngine();
    const textParts: string[] = [];

    const session = await engine.execute(
      { task: createMockTask(), workspace: 'test', provider },
      { onTextDelta: (text) => textParts.push(text) },
    );

    expect(textParts.join('')).toBe('Hello world!');
    expect(session.status).toBe('completed');
    expect(session.messages).toHaveLength(2); // user + assistant
  });

  it('processes tool use chunks into actions', async () => {
    const provider = createMockProvider([
      { type: 'tool_use', toolUse: { id: 'call_1', name: 'create_file', arguments: { path: 'new.ts', content: 'test' } } },
      { type: 'done', stopReason: 'tool_use' },
    ]);

    const engine = new ExecutionEngine();
    const proposedActions: unknown[] = [];

    const session = await engine.execute(
      { task: createMockTask(), workspace: 'test', provider },
      { onActionProposed: (action, id) => proposedActions.push({ action, id }) },
    );

    expect(proposedActions).toHaveLength(1);
    expect(session.actions).toHaveLength(1);
    expect(session.actions[0].action.type).toBe('file_create');
  });

  it('emits execution events', async () => {
    const eventBus = new EventBus();
    const events: { name: string; payload: unknown }[] = [];

    eventBus.on('execution:started', (p) => events.push({ name: 'started', payload: p }));
    eventBus.on('execution:completed', (p) => events.push({ name: 'completed', payload: p }));
    eventBus.on('execution:output', (p) => events.push({ name: 'output', payload: p }));

    const provider = createMockProvider([
      { type: 'delta', content: 'text' },
      { type: 'done', stopReason: 'end' },
    ]);

    const engine = new ExecutionEngine();
    await engine.execute({
      task: createMockTask(),
      workspace: 'test',
      provider,
      eventBus,
    });

    expect(events.find((e) => e.name === 'started')).toBeDefined();
    expect(events.find((e) => e.name === 'completed')).toBeDefined();
    expect(events.find((e) => e.name === 'output')).toBeDefined();
  });

  it('handles provider errors gracefully', async () => {
    const provider: ProviderAdapter = {
      name: 'failing',
      async *sendMessage(): AsyncIterable<StreamChunk> {
        throw new Error('API rate limit exceeded');
      },
      async listModels() { return []; },
      getCapabilities() { return { streaming: true, toolUse: true, vision: false, maxContextTokens: 100000 }; },
    };

    const engine = new ExecutionEngine();
    const errors: Error[] = [];

    const session = await engine.execute(
      { task: createMockTask(), workspace: 'test', provider },
      { onError: (err) => errors.push(err) },
    );

    expect(session.status).toBe('failed');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('rate limit');
  });

  it('builds system prompt from AIDF context', () => {
    const engine = new ExecutionEngine();
    const task = createMockTask();

    const prompt = engine.buildSystemPrompt(task, {
      capabilities: {
        present: true,
        aidfPath: '/test/.ai',
        hasAgentsFile: true,
        hasConfig: false,
        features: new Set(['tasks']),
      },
      agentsContent: 'This is a TypeScript project.',
      tasks: [],
      roles: [],
      skills: [],
      plans: [],
    });

    expect(prompt).toContain('TypeScript project');
    expect(prompt).toContain('Test Task');
    expect(prompt).toContain('Test the execution engine');
  });
});
