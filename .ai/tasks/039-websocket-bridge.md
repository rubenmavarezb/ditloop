# TASK: WebSocket Bridge

## Goal
Implement WebSocket server that bridges EventBus events to remote clients with subscription filtering and multi-client support.

## Scope

### Allowed
- packages/server/src/ws/websocket-bridge.ts
- packages/server/src/ws/websocket-bridge.test.ts
- packages/server/src/ws/index.ts

### Forbidden
- packages/core/** (import EventBus type only)

## Requirements
1. Bridge EventBus events to WebSocket clients in real-time
2. Subscription filtering by event pattern (e.g. `workspace:*`, `git:*`, `approval:*`, `launcher:*`)
3. Support multiple concurrent clients (max 10)
4. Ping/pong keepalive (30s interval)
5. Auto-unsubscribe and cleanup on client disconnect
6. Rate limiting per client (100 events/sec)
7. Token authentication on WebSocket upgrade (same token as REST)
8. Message format: `{ event: string, data: object, timestamp: number }`

## Definition of Done
- [ ] WebSocket server accepting connections on /ws path
- [ ] Event filtering by pattern works correctly
- [ ] Multiple clients receive events simultaneously
- [ ] Keepalive prevents timeouts
- [ ] Client disconnect triggers cleanup
- [ ] Unit tests with mock EventBus

## Status: 📋 Planned
