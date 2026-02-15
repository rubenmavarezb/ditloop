import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import type { EventBus } from '../events/index.js';
import type { Message } from '../provider/index.js';
import type { Action } from './action-parser.js';

/** Status of a tracked action within a session. */
export type ActionStatus = 'proposed' | 'approved' | 'rejected' | 'executed' | 'failed';

/** A tracked action with its approval status. */
export interface TrackedAction {
  id: string;
  action: Action;
  status: ActionStatus;
  result?: string;
  proposedAt: number;
  resolvedAt?: number;
}

/** Status of an execution session. */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'failed';

/** Serializable session state for persistence. */
export interface SessionState {
  id: string;
  taskId: string;
  workspace: string;
  status: SessionStatus;
  messages: Message[];
  actions: TrackedAction[];
  createdAt: number;
  updatedAt: number;
}

/** Options for creating a new ExecutionSession. */
export interface ExecutionSessionOptions {
  taskId: string;
  workspace: string;
  eventBus?: EventBus;
  sessionsDir?: string;
}

/**
 * Manages a multi-turn execution session with conversation history,
 * action tracking, and persistence to disk.
 */
export class ExecutionSession {
  readonly id: string;
  readonly taskId: string;
  readonly workspace: string;

  private _status: SessionStatus = 'active';
  private _messages: Message[] = [];
  private _actions: TrackedAction[] = [];
  private _createdAt: number;
  private _updatedAt: number;
  private eventBus?: EventBus;
  private sessionsDir: string;

  constructor(options: ExecutionSessionOptions) {
    this.id = randomUUID();
    this.taskId = options.taskId;
    this.workspace = options.workspace;
    this.eventBus = options.eventBus;
    this.sessionsDir = options.sessionsDir ?? join(homedir(), '.ditloop', 'sessions');
    this._createdAt = Date.now();
    this._updatedAt = Date.now();
  }

  /** Current session status. */
  get status(): SessionStatus {
    return this._status;
  }

  /** Conversation messages. */
  get messages(): readonly Message[] {
    return this._messages;
  }

  /** Tracked actions. */
  get actions(): readonly TrackedAction[] {
    return this._actions;
  }

  /**
   * Add a message to the conversation history.
   *
   * @param message - The message to add
   */
  addMessage(message: Message): void {
    this._messages.push(message);
    this.touch();
  }

  /**
   * Propose an action for approval.
   *
   * @param action - The action to propose
   * @returns The tracked action with generated ID
   */
  proposeAction(action: Action): TrackedAction {
    const tracked: TrackedAction = {
      id: randomUUID(),
      action,
      status: 'proposed',
      proposedAt: Date.now(),
    };

    this._actions.push(tracked);
    this.touch();

    if (this.eventBus) {
      this.eventBus.emit('approval:requested', {
        id: tracked.id,
        action: action.type,
        detail: JSON.stringify(action),
        workspace: this.workspace,
      });
    }

    return tracked;
  }

  /**
   * Approve a proposed action.
   *
   * @param actionId - ID of the action to approve
   * @throws Error if action not found or not in proposed state
   */
  approveAction(actionId: string): void {
    const tracked = this.findAction(actionId);
    if (tracked.status !== 'proposed') {
      throw new Error(`Action "${actionId}" is not in proposed state (current: ${tracked.status})`);
    }

    tracked.status = 'approved';
    tracked.resolvedAt = Date.now();
    this.touch();

    if (this.eventBus) {
      this.eventBus.emit('approval:granted', { id: actionId });
    }
  }

  /**
   * Reject a proposed action.
   *
   * @param actionId - ID of the action to reject
   * @param reason - Optional reason for rejection
   * @throws Error if action not found or not in proposed state
   */
  rejectAction(actionId: string, reason?: string): void {
    const tracked = this.findAction(actionId);
    if (tracked.status !== 'proposed') {
      throw new Error(`Action "${actionId}" is not in proposed state (current: ${tracked.status})`);
    }

    tracked.status = 'rejected';
    tracked.result = reason;
    tracked.resolvedAt = Date.now();
    this.touch();

    if (this.eventBus) {
      this.eventBus.emit('approval:denied', { id: actionId, reason });
    }
  }

  /**
   * Mark an action as executed.
   *
   * @param actionId - ID of the executed action
   * @param result - Optional execution result
   */
  markExecuted(actionId: string, result?: string): void {
    const tracked = this.findAction(actionId);
    tracked.status = 'executed';
    tracked.result = result;
    tracked.resolvedAt = Date.now();
    this.touch();
  }

  /**
   * Mark an action as failed.
   *
   * @param actionId - ID of the failed action
   * @param error - Error message
   */
  markFailed(actionId: string, error: string): void {
    const tracked = this.findAction(actionId);
    tracked.status = 'failed';
    tracked.result = error;
    tracked.resolvedAt = Date.now();
    this.touch();
  }

  /**
   * Pause the session.
   */
  pause(): void {
    this._status = 'paused';
    this.touch();
  }

  /**
   * Resume a paused session.
   */
  resume(): void {
    if (this._status !== 'paused') {
      throw new Error(`Cannot resume session in "${this._status}" state`);
    }
    this._status = 'active';
    this.touch();
  }

  /**
   * Mark the session as completed.
   */
  complete(): void {
    this._status = 'completed';
    this.touch();
  }

  /**
   * Mark the session as failed.
   */
  fail(): void {
    this._status = 'failed';
    this.touch();
  }

  /**
   * Persist the session state to disk.
   */
  async save(): Promise<void> {
    await mkdir(this.sessionsDir, { recursive: true });
    const filePath = join(this.sessionsDir, `${this.id}.json`);
    const state = this.toState();
    await writeFile(filePath, JSON.stringify(state, null, 2));
  }

  /**
   * Export session state as a serializable object.
   *
   * @returns Session state object
   */
  toState(): SessionState {
    return {
      id: this.id,
      taskId: this.taskId,
      workspace: this.workspace,
      status: this._status,
      messages: [...this._messages],
      actions: [...this._actions],
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Load a session from disk.
   *
   * @param sessionId - The session ID to load
   * @param options - Optional event bus and sessions directory
   * @returns Loaded ExecutionSession, or undefined if not found
   */
  static async load(
    sessionId: string,
    options?: { eventBus?: EventBus; sessionsDir?: string },
  ): Promise<ExecutionSession | undefined> {
    const dir = options?.sessionsDir ?? join(homedir(), '.ditloop', 'sessions');
    const filePath = join(dir, `${sessionId}.json`);

    let data: string;
    try {
      data = await readFile(filePath, 'utf-8');
    } catch {
      return undefined;
    }

    const state = JSON.parse(data) as SessionState;
    const session = new ExecutionSession({
      taskId: state.taskId,
      workspace: state.workspace,
      eventBus: options?.eventBus,
      sessionsDir: dir,
    });

    // Restore internal state
    (session as { id: string }).id = state.id;
    session._status = state.status;
    session._messages = state.messages;
    session._actions = state.actions;
    session._createdAt = state.createdAt;
    session._updatedAt = state.updatedAt;

    return session;
  }

  private findAction(actionId: string): TrackedAction {
    const action = this._actions.find((a) => a.id === actionId);
    if (!action) {
      throw new Error(`Action "${actionId}" not found in session`);
    }
    return action;
  }

  private touch(): void {
    this._updatedAt = Date.now();
  }
}
