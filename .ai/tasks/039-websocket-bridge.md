# TASK: WebSocket Bridge

## Goal
Implement WebSocket server that bridges EventBus to remote clients with subscription filtering and multi-client support.

## Scope

### Allowed
- packages/server/src/ws/websocket-bridge.ts
- packages/server/src/ws/websocket-bridge.test.ts

### Forbidden
- packages/core/** (import EventBus only)

## Requirements
1. Bridge EventBus events to WebSocket clients
2. Subscription filtering by pattern (workspace:*, git:*, etc.)
3. Support multiple concurrent clients
4. Ping/pong keepalive (30s interval)
5. Client reconnection handling
6. Rate limiting per client (100 events/sec)

## Definition of Done
- [ ] WebSocket server accepting connections
- [ ] Event filtering working correctly
- [ ] Multiple clients receive events
- [ ] Keepalive prevents timeouts
- [ ] Integration tests with mock EventBus

## Status: 📋 Planned
