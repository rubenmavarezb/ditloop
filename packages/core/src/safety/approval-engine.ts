import { randomUUID } from 'node:crypto';
import type { EventBus } from '../events/index.js';
import type { Action } from '../executor/index.js';

/** Status of an action in the approval queue. */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'edited';

/** An action pending review in the approval queue. */
export interface QueuedAction {
  id: string;
  action: Action;
  status: ApprovalStatus;
  editedAction?: Action;
}

/** Result of the approval process for a batch of actions. */
export interface ApprovalResult {
  approved: QueuedAction[];
  rejected: QueuedAction[];
}

/** Options for constructing an ApprovalEngine. */
export interface ApprovalEngineOptions {
  workspace: string;
  eventBus?: EventBus;
}

/**
 * Core approval workflow that queues AI-proposed actions for human review.
 * Every action must be explicitly approved, rejected, or edited before execution.
 */
export class ApprovalEngine {
  private queue: QueuedAction[] = [];
  private workspace: string;
  private eventBus?: EventBus;
  private resolvePromise?: (result: ApprovalResult) => void;

  constructor(options: ApprovalEngineOptions) {
    this.workspace = options.workspace;
    this.eventBus = options.eventBus;
  }

  /** The current approval queue. */
  get pendingActions(): readonly QueuedAction[] {
    return this.queue;
  }

  /**
   * Queue actions for human review. Returns a promise that resolves
   * when all actions have been approved or rejected.
   *
   * @param actions - Actions to queue for review
   * @returns Promise that resolves with the approval result
   */
  requestApproval(actions: Action[]): Promise<ApprovalResult> {
    this.queue = actions.map((action) => ({
      id: randomUUID(),
      action,
      status: 'pending' as ApprovalStatus,
    }));

    if (this.eventBus) {
      for (const item of this.queue) {
        this.eventBus.emit('approval:requested', {
          id: item.id,
          action: item.action.type,
          detail: JSON.stringify(item.action),
          workspace: this.workspace,
        });
      }
    }

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.checkCompletion();
    });
  }

  /**
   * Approve a single action by ID.
   *
   * @param actionId - ID of the action to approve
   * @throws Error if action not found
   */
  approveOne(actionId: string): void {
    const item = this.findItem(actionId);
    item.status = 'approved';

    if (this.eventBus) {
      this.eventBus.emit('approval:granted', { id: actionId });
    }

    this.checkCompletion();
  }

  /**
   * Approve all pending actions.
   */
  approveAll(): void {
    for (const item of this.queue) {
      if (item.status === 'pending') {
        item.status = 'approved';
        if (this.eventBus) {
          this.eventBus.emit('approval:granted', { id: item.id });
        }
      }
    }
    this.checkCompletion();
  }

  /**
   * Reject a single action by ID.
   *
   * @param actionId - ID of the action to reject
   * @param reason - Optional reason for rejection
   * @throws Error if action not found
   */
  reject(actionId: string, reason?: string): void {
    const item = this.findItem(actionId);
    item.status = 'rejected';

    if (this.eventBus) {
      this.eventBus.emit('approval:denied', { id: actionId, reason });
    }

    this.checkCompletion();
  }

  /**
   * Edit an action, replacing it with a modified version and marking it as approved.
   *
   * @param actionId - ID of the action to edit
   * @param editedAction - The modified action
   * @throws Error if action not found
   */
  edit(actionId: string, editedAction: Action): void {
    const item = this.findItem(actionId);
    item.status = 'edited';
    item.editedAction = editedAction;

    if (this.eventBus) {
      this.eventBus.emit('approval:granted', { id: actionId });
    }

    this.checkCompletion();
  }

  private findItem(actionId: string): QueuedAction {
    const item = this.queue.find((q) => q.id === actionId);
    if (!item) {
      throw new Error(`Action "${actionId}" not found in approval queue`);
    }
    return item;
  }

  private checkCompletion(): void {
    if (!this.resolvePromise) return;

    const allResolved = this.queue.every((item) => item.status !== 'pending');
    if (!allResolved) return;

    const approved = this.queue.filter(
      (item) => item.status === 'approved' || item.status === 'edited',
    );
    const rejected = this.queue.filter((item) => item.status === 'rejected');

    this.resolvePromise({ approved, rejected });
    this.resolvePromise = undefined;
  }
}
