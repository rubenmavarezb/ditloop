// @ditloop/server — HTTP/WebSocket API for remote access

export { createServer } from './server.js';
export type { DitLoopServerDeps, DitLoopServerInstance } from './server.js';

export { getOrCreateToken, tokenAuthMiddleware } from './auth/index.js';

export { healthRoutes } from './api/health.js';
export { createWorkspaceRoutes } from './api/workspaces.js';
export { createProfileRoutes } from './api/profiles.js';
export { createLauncherRoutes } from './api/launcher.js';
export { createApprovalRoutes } from './api/approvals.js';
export { createExecutionRoutes } from './api/executions.js';

export { WebSocketBridge } from './ws/index.js';
export type { WsOutMessage } from './ws/index.js';

export { ExecutionMonitor } from './execution/index.js';
export type {
  ExecutionStatus,
  TrackedExecution,
  SubmitOptions,
  RateLimitConfig,
  ExecutionStats,
  OutputLine,
} from './execution/index.js';

export { StateSyncEngine } from './sync/index.js';
export type {
  Delta,
  StateSnapshot,
  OfflineEvent,
  ConflictStrategy,
  ProcessResult,
} from './sync/index.js';

export { createSyncRoutes } from './api/sync.js';
export type { SyncRouteDeps } from './api/sync.js';

export { PushNotificationService } from './notifications/index.js';
export type {
  NotificationType,
  DitLoopNotification,
  SubscriptionInfo,
  PushSubscriptionData,
  VapidKeys,
} from './notifications/index.js';

export { createNotificationRoutes } from './api/notifications.js';
export type { NotificationRouteDeps } from './api/notifications.js';

export { shouldSendNotification } from './notifications/index.js';
export type { NotificationPreferences } from './notifications/index.js';
