# @ditloop/server

HTTP/WebSocket server for DitLoop — REST API for remote access, real-time events, and push notifications.

## Installation

```bash
pnpm add @ditloop/server
```

## Key Exports

| Module | Purpose |
|--------|---------|
| `createServer` | Factory to start HTTP/WebSocket server |
| `tokenAuthMiddleware` | Bearer token authentication middleware |
| HTTP routes | REST API for workspaces, profiles, executions, approvals |
| `WebSocketBridge` | Real-time event streaming to connected clients |
| `ExecutionMonitor` | Task execution tracking with rate limiting |
| `StateSyncEngine` | Offline-first state synchronization with conflict resolution |
| `PushNotificationService` | Web push notifications via VAPID |

## Usage

```typescript
import { createServer } from '@ditloop/server';

const server = await createServer({
  port: 3001,
  core: coreInstance,
});
```

## Tech Stack

- [Hono](https://hono.dev/) — HTTP framework
- [ws](https://github.com/websockets/ws) — WebSocket server
- [web-push](https://github.com/web-push-libs/web-push) — Push notifications

See the [root README](../../README.md) for full documentation.
