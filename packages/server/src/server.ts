import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve, type ServerType } from '@hono/node-server';
import type {
  DitLoopConfig,
  EventBus,
  WorkspaceManager,
  ProfileManager,
  AiLauncher,
  ExecutionEngine,
  ApprovalEngine,
} from '@ditloop/core';
import { ContextLoader } from '@ditloop/core';
import { getOrCreateToken, tokenAuthMiddleware } from './auth/index.js';
import { healthRoutes } from './api/health.js';
import { createWorkspaceRoutes } from './api/workspaces.js';
import { createProfileRoutes } from './api/profiles.js';
import { createLauncherRoutes } from './api/launcher.js';
import { createApprovalRoutes } from './api/approvals.js';
import { createExecutionRoutes } from './api/executions.js';
import { createNotificationRoutes } from './api/notifications.js';
import { WebSocketBridge } from './ws/websocket-bridge.js';
import { ExecutionMonitor } from './execution/execution-monitor.js';
import { PushNotificationService } from './notifications/index.js';
import { StateSyncEngine } from './sync/index.js';
import { createSyncRoutes } from './api/sync.js';

/** Dependencies needed to create a DitLoop server. */
export interface DitLoopServerDeps {
  config: DitLoopConfig;
  eventBus: EventBus;
  workspaceManager: WorkspaceManager;
  profileManager: ProfileManager;
  aiLauncher: AiLauncher;
  executionEngine: ExecutionEngine;
  getApprovalEngine: () => ApprovalEngine | undefined;
}

/** Running server instance. */
export interface DitLoopServerInstance {
  /** The HTTP server instance. */
  httpServer: ServerType;
  /** The WebSocket bridge. */
  wsBridge: WebSocketBridge;
  /** The execution monitor. */
  executionMonitor: ExecutionMonitor;
  /** The push notification service. */
  pushNotificationService: PushNotificationService;
  /** The state sync engine. */
  stateSyncEngine: StateSyncEngine;
  /** The authentication token. */
  token: string;
  /** Stop the server gracefully. */
  close: () => Promise<void>;
}

/**
 * Create and start the DitLoop HTTP/WebSocket server.
 *
 * @param deps - Core module dependencies
 * @returns Running server instance with close() method
 */
export async function createServer(deps: DitLoopServerDeps): Promise<DitLoopServerInstance> {
  const { config, eventBus } = deps;
  const port = config.server.port;
  const host = config.server.host;
  const token = getOrCreateToken();

  // Create execution monitor
  const executionMonitor = new ExecutionMonitor(eventBus);

  // Create state sync engine
  const stateSyncEngine = new StateSyncEngine(eventBus);

  // Create push notification service
  const vapidKeys = PushNotificationService.loadOrCreateVapidKeys();
  const contactEmail = config.server.contactEmail;
  const pushNotificationService = new PushNotificationService(
    vapidKeys.publicKey,
    vapidKeys.privateKey,
    contactEmail,
  );

  // Create Hono app
  const app = new Hono();

  // Global middleware
  app.use('*', cors({
    origin: [`http://localhost:${port}`, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use('/api/*', tokenAuthMiddleware(token));

  // Mount routes
  const contextLoader = new ContextLoader();
  app.route('/api', healthRoutes);
  app.route('/api', createWorkspaceRoutes({
    workspaceManager: deps.workspaceManager,
    contextLoader,
  }));
  app.route('/api', createProfileRoutes({
    profileManager: deps.profileManager,
  }));
  app.route('/api', createLauncherRoutes({
    aiLauncher: deps.aiLauncher,
    workspaceManager: deps.workspaceManager,
  }));
  app.route('/api', createApprovalRoutes({
    getApprovalEngine: deps.getApprovalEngine,
  }));
  app.route('/api', createExecutionRoutes({
    executionEngine: deps.executionEngine,
    workspaceManager: deps.workspaceManager,
    executionMonitor,
    eventBus,
  }));
  // Notification preferences (mutable at runtime)
  const configNotif = config.notifications;
  let notificationPreferences: import('./notifications/preferences.js').NotificationPreferences = {
    enabled: configNotif?.enabled ?? true,
    quietHours: configNotif?.quietHours ?? { enabled: false, start: '22:00', end: '08:00' },
    events: configNotif?.events ?? {
      'approval-requested': true,
      'execution-completed': true,
      'execution-failed': true,
      'session-message': true,
    },
    workspaceOverrides: configNotif?.workspaceOverrides ?? {},
  };

  app.route('/api', createNotificationRoutes({
    pushService: pushNotificationService,
    getPreferences: () => notificationPreferences,
    setPreferences: (prefs) => { notificationPreferences = prefs; },
  }));
  app.route('/api', createSyncRoutes({
    syncEngine: stateSyncEngine,
  }));

  // Global error handler
  app.onError((err, c) => {
    console.error('[ditloop-server] Error:', err.message);
    return c.json({ error: 'Internal server error' }, 500);
  });

  // Start HTTP server
  const httpServer = serve({
    fetch: app.fetch,
    port,
    hostname: host,
  });

  // Attach WebSocket bridge
  const wsBridge = new WebSocketBridge(eventBus, token);
  wsBridge.attach(httpServer);

  const close = async (): Promise<void> => {
    wsBridge.close();
    executionMonitor.destroy();
    stateSyncEngine.destroy();
    httpServer.close();

    await new Promise<void>((resolve) => {
      httpServer.on('close', resolve);
      // Force close after 5s
      setTimeout(resolve, 5000);
    });
  };

  return {
    httpServer,
    wsBridge,
    executionMonitor,
    pushNotificationService,
    stateSyncEngine,
    token,
    close,
  };
}
