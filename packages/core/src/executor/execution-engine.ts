import type { EventBus } from '../events/index.js';
import type { ProviderAdapter, SendOptions, StreamChunk, ToolDefinition } from '../provider/index.js';
import type { AidfTask, AidfContext } from '../aidf/index.js';
import { ActionParser } from './action-parser.js';
import type { Action } from './action-parser.js';
import { ExecutionSession } from './execution-session.js';

/** Options for executing a task. */
export interface ExecuteOptions {
  task: AidfTask;
  workspace: string;
  provider: ProviderAdapter;
  aidfContext?: AidfContext;
  eventBus?: EventBus;
  tools?: ToolDefinition[];
  model?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}

/** Callback interface for streaming execution events. */
export interface ExecutionCallbacks {
  onTextDelta?: (text: string) => void;
  onActionProposed?: (action: Action, trackingId: string) => void;
  onDone?: (session: ExecutionSession) => void;
  onError?: (error: Error) => void;
}

/**
 * Orchestrates AI-assisted task execution. Builds prompts from AIDF context,
 * streams AI responses, parses actions, and manages execution sessions.
 */
export class ExecutionEngine {
  private actionParser = new ActionParser();

  /**
   * Execute an AIDF task using an AI provider.
   *
   * @param options - Task, workspace, provider, and context options
   * @param callbacks - Optional callbacks for streaming events
   * @returns ExecutionSession tracking the execution
   */
  async execute(options: ExecuteOptions, callbacks?: ExecutionCallbacks): Promise<ExecutionSession> {
    const { task, workspace, provider, aidfContext, eventBus } = options;

    const session = new ExecutionSession({
      taskId: task.id,
      workspace,
      eventBus,
    });

    // Emit execution started
    if (eventBus) {
      eventBus.emit('execution:started', { taskId: task.id, workspace });
    }

    try {
      const systemPrompt = this.buildSystemPrompt(task, aidfContext);
      const userMessage = this.buildUserMessage(task);

      session.addMessage({ role: 'user', content: userMessage });

      const sendOptions: SendOptions = {
        messages: [{ role: 'user', content: userMessage }],
        systemPrompt,
        model: options.model,
        maxTokens: options.maxTokens,
        tools: options.tools ?? this.getDefaultTools(),
        signal: options.signal,
      };

      let textAccumulator = '';

      for await (const chunk of provider.sendMessage(sendOptions)) {
        this.processChunk(chunk, session, callbacks, textAccumulator, (text) => {
          textAccumulator = text;
        });

        if (eventBus && chunk.type === 'delta') {
          eventBus.emit('execution:output', {
            taskId: task.id,
            stream: 'stdout',
            data: chunk.content,
          });
        }
      }

      // Parse any remaining text for markdown actions
      if (textAccumulator) {
        session.addMessage({ role: 'assistant', content: textAccumulator });
        const markdownActions = this.actionParser.parseMarkdown(textAccumulator);
        for (const action of markdownActions) {
          const tracked = session.proposeAction(action);
          callbacks?.onActionProposed?.(action, tracked.id);
        }
      }

      session.complete();

      if (eventBus) {
        eventBus.emit('execution:completed', { taskId: task.id, exitCode: 0 });
      }

      callbacks?.onDone?.(session);
    } catch (error) {
      session.fail();
      const err = error instanceof Error ? error : new Error(String(error));

      if (eventBus) {
        eventBus.emit('execution:error', { taskId: task.id, error: err.message });
      }

      callbacks?.onError?.(err);
    }

    return session;
  }

  /**
   * Build a system prompt from AIDF context.
   *
   * @param task - The AIDF task being executed
   * @param context - Optional AIDF context with roles, skills, etc.
   * @returns System prompt string
   */
  buildSystemPrompt(task: AidfTask, context?: AidfContext): string {
    const parts: string[] = [];

    parts.push('You are an AI assistant helping with a development task in the DitLoop workspace.');
    parts.push('');

    if (context?.agentsContent) {
      parts.push('## Project Context');
      parts.push(context.agentsContent);
      parts.push('');
    }

    parts.push('## Task');
    parts.push(`Title: ${task.title}`);
    parts.push(`Goal: ${task.goal}`);

    if (task.scope) {
      parts.push(`\nScope:\n${task.scope}`);
    }

    if (task.requirements) {
      parts.push(`\nRequirements:\n${task.requirements}`);
    }

    if (task.dod) {
      parts.push(`\nDefinition of Done:\n${task.dod}`);
    }

    parts.push('');
    parts.push('## Instructions');
    parts.push('- Use the provided tools to create/edit files and run commands.');
    parts.push('- All proposed changes will be reviewed by the developer before execution.');
    parts.push('- Follow the project conventions and coding standards.');
    parts.push('- Explain your reasoning before making changes.');

    return parts.join('\n');
  }

  private buildUserMessage(task: AidfTask): string {
    return `Please execute this task: ${task.title}\n\nGoal: ${task.goal}`;
  }

  private processChunk(
    chunk: StreamChunk,
    session: ExecutionSession,
    callbacks: ExecutionCallbacks | undefined,
    textAccumulator: string,
    setTextAccumulator: (text: string) => void,
  ): void {
    switch (chunk.type) {
      case 'delta':
        setTextAccumulator(textAccumulator + chunk.content);
        callbacks?.onTextDelta?.(chunk.content);
        break;

      case 'tool_use': {
        const action = this.actionParser.parseToolUse(chunk.toolUse);
        if (action) {
          const tracked = session.proposeAction(action);
          callbacks?.onActionProposed?.(action, tracked.id);
        }
        break;
      }

      case 'done':
        // Handled in the main loop
        break;
    }
  }

  private getDefaultTools(): ToolDefinition[] {
    return [
      {
        name: 'create_file',
        description: 'Create a new file with the given content',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to workspace root' },
            content: { type: 'string', description: 'File content' },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'edit_file',
        description: 'Edit an existing file by replacing content',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to workspace root' },
            old_content: { type: 'string', description: 'Content to find and replace' },
            new_content: { type: 'string', description: 'Replacement content' },
          },
          required: ['path', 'old_content', 'new_content'],
        },
      },
      {
        name: 'run_command',
        description: 'Run a shell command in the workspace',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'The command to run' },
            cwd: { type: 'string', description: 'Working directory (optional)' },
          },
          required: ['command'],
        },
      },
      {
        name: 'git_operation',
        description: 'Perform a git operation',
        parameters: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['commit', 'branch', 'push', 'pull', 'stage', 'checkout'],
            },
            args: { type: 'object', description: 'Operation arguments' },
          },
          required: ['operation'],
        },
      },
    ];
  }
}
