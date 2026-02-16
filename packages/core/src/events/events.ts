// Event type definitions for DitLoop's typed event bus

export interface WorkspaceEvents {
  'workspace:activated': { id: string; name: string; path: string };
  'workspace:deactivated': { id: string };
  'workspace:created': { id: string; name: string; path: string };
  'workspace:removed': { id: string };
  'workspace:error': { id: string; error: string };
}

export interface ProfileEvents {
  'profile:switched': { name: string; email: string; sshHost?: string };
  'profile:mismatch': { expected: string; actual: string; workspace: string };
  'profile:guard-blocked': { workspace: string; expected: string; actual: string };
}

export interface ExecutionEvents {
  'execution:started': { taskId: string; workspace: string };
  'execution:progress': { taskId: string; message: string; percent?: number };
  'execution:output': { taskId: string; stream: 'stdout' | 'stderr'; data: string };
  'execution:completed': { taskId: string; exitCode: number };
  'execution:error': { taskId: string; error: string };
  'execution:queued': { taskId: string; position: number; provider: string };
  'execution:dequeued': { taskId: string; provider: string };
}

export interface ApprovalEvents {
  'approval:requested': { id: string; action: string; detail: string; workspace: string };
  'approval:granted': { id: string };
  'approval:denied': { id: string; reason?: string };
}

export interface GitEvents {
  'git:status-changed': { workspace: string; branch: string; modified: number; staged: number; untracked: number };
  'git:commit': { workspace: string; hash: string; message: string };
  'git:push': { workspace: string; branch: string; remote: string };
  'git:pull': { workspace: string; branch: string };
  'git:branch-created': { workspace: string; branch: string };
  'git:branch-switched': { workspace: string; branch: string };
  'git:branch-deleted': { workspace: string; branch: string };
}

export interface ChatEvents {
  'chat:message-sent': { workspace: string; content: string; provider: string };
  'chat:message-received': { workspace: string; content: string; provider: string };
  'chat:stream-chunk': { workspace: string; chunk: string; provider: string };
  'chat:error': { workspace: string; error: string; provider: string };
}

export interface AidfEvents {
  'aidf:detected': { workspace: string; path: string };
  'aidf:context-loaded': { workspace: string; tasks: number; roles: number };
  'aidf:task-selected': { workspace: string; taskId: string; title: string };
  'aidf:created': { workspace: string; type: string; id: string; filePath: string };
  'aidf:updated': { workspace: string; type: string; id: string; filePath: string };
  'aidf:deleted': { workspace: string; type: string; id: string; filePath: string };
}

export interface LauncherEvents {
  'launcher:context-built': { workspace: string; sections: string[]; totalSize: number };
  'launcher:started': { workspace: string; cli: string; pid: number };
  'launcher:exited': { workspace: string; cli: string; exitCode: number | null };
}

export interface ActionEvents {
  'action:executed': { id: string; type: string; path?: string; workspace: string };
  'action:failed': { id: string; type: string; error: string; workspace: string };
  'action:rolled-back': { id: string; workspace: string };
}

export interface ProviderEvents {
  'provider:connected': { name: string };
  'provider:disconnected': { name: string; reason?: string };
  'provider:error': { name: string; error: string };
}

export type DitLoopEventMap =
  & WorkspaceEvents
  & ProfileEvents
  & ExecutionEvents
  & ApprovalEvents
  & GitEvents
  & ActionEvents
  & ChatEvents
  & AidfEvents
  & LauncherEvents
  & ProviderEvents;

export type DitLoopEventName = keyof DitLoopEventMap;

/** All known DitLoop event names. Useful for dynamic subscription. */
export const ALL_EVENT_NAMES: DitLoopEventName[] = [
  'workspace:activated', 'workspace:deactivated', 'workspace:created', 'workspace:removed', 'workspace:error',
  'profile:switched', 'profile:mismatch', 'profile:guard-blocked',
  'execution:started', 'execution:progress', 'execution:output', 'execution:completed', 'execution:error', 'execution:queued', 'execution:dequeued',
  'approval:requested', 'approval:granted', 'approval:denied',
  'git:status-changed', 'git:commit', 'git:push', 'git:pull', 'git:branch-created', 'git:branch-switched', 'git:branch-deleted',
  'action:executed', 'action:failed', 'action:rolled-back',
  'chat:message-sent', 'chat:message-received', 'chat:stream-chunk', 'chat:error',
  'aidf:detected', 'aidf:context-loaded', 'aidf:task-selected', 'aidf:created', 'aidf:updated', 'aidf:deleted',
  'launcher:context-built', 'launcher:started', 'launcher:exited',
  'provider:connected', 'provider:disconnected', 'provider:error',
] as const;
