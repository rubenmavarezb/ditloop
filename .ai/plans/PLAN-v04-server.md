# PLAN: v0.4 Server & API

## Overview

Turn DitLoop into a service with HTTP/WebSocket API. Enables remote access to workspaces, remote task execution, and real-time event streaming. New `@ditloop/server` package. Prepares infrastructure for mobile (v0.5).

## Goals

- HTTP REST API for workspaces, profiles, sessions
- WebSocket bridge for real-time EventBus events
- Remote approval workflow (answer from any client)
- Server lifecycle management (daemon, CLI)
- Execution API with SSE streaming
- Execution monitoring with concurrency control
- TUI dashboard for all executions

## Non-Goals

- Public internet deployment (localhost only)
- Multi-user auth (single user, token-based)
- HTTPS/TLS (localhost only for now)
- Client SDK or VS Code extension (post v0.4)
- API versioning

## Tasks

### Server Mode (038-041)

New `packages/server/` with HTTP + WebSocket server.

- [ ] `038-server-package.md` — Fastify/Hono server, REST routes, token auth, CORS
- [ ] `039-websocket-bridge.md` — EventBus → WebSocket bridge, subscription filtering, multi-client
- [ ] `040-remote-approval.md` — POST /api/approvals/:id, broadcast to clients, first-response-wins
- [ ] `041-server-cli.md` — `ditloop server start/stop/status`, daemon, PID file, TUI indicator

**038 first, then 039-041 parallelizable**

### Remote Execution (042-044)

Execute and monitor tasks remotely.

- [ ] `042-execution-api.md` — POST /api/execute, GET /api/executions, SSE stream, cancel
- [ ] `043-execution-monitor.md` — ExecutionMonitor: track active/queued, rate limiting per provider, FIFO queue
- [ ] `044-execution-dashboard-view.md` — TUI dashboard: table of all executions, real-time, cancel/retry

**042 and 043 parallelizable, 044 depends on both**

## Dependencies

- Fastify or Hono (HTTP server)
- `ws` (WebSocket)
- v0.3 complete (chat, sessions)
- v0.2 complete (executor, safety)
- Config already has `server: { enabled, port, host }` in schema

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Port conflicts | Medium | High | Check availability, configurable, fallback to random |
| Approval race conditions | Medium | Medium | Atomic first-write-wins, reject duplicates |
| Memory leak with many WebSocket clients | Low | Medium | Max 10 clients, auto-unsubscribe on disconnect |
| Server crash leaves stale PID | Medium | Low | Validate PID on start, cleanup stale |
| Long tasks block shutdown | Medium | Medium | Graceful shutdown: 30s wait then force-kill |

## Success Criteria

- [ ] Server starts/stops cleanly via CLI
- [ ] REST endpoints return correct JSON
- [ ] WebSocket clients receive events in <100ms
- [ ] Remote approval works from any client
- [ ] SSE streams execution output in real-time
- [ ] Rate limiting queues excess tasks correctly
- [ ] Execution dashboard shows live state
- [ ] Token auth blocks unauthorized requests
- [ ] All tests pass
