# PLAN: v0.4 Server & API

## Overview

Turn DitLoop into a service with HTTP/WebSocket API. Enables remote access to workspaces, remote AI CLI launching, remote approval, and real-time event streaming. New `@ditloop/server` package. Prepares infrastructure for mobile (v0.5).

## Philosophy

The server exposes DitLoop's core capabilities over HTTP/WebSocket so that any client (mobile PWA, IDE extension, CI/CD pipeline) can interact with it. It does NOT duplicate logic — it delegates to existing core modules (WorkspaceManager, AiLauncher, ApprovalEngine, ExecutionEngine).

## Goals

- HTTP REST API for workspaces, profiles, AIDF context, launcher
- WebSocket bridge for real-time EventBus events
- Remote approval workflow (answer from any client)
- Remote AI CLI launch (trigger `claude`/`aider` from API)
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
- Chat/conversation endpoints (AI chat is CLI-native, not server-based)

## Tasks

### Server Mode (038-041)

New `packages/server/` with HTTP + WebSocket server.

- [ ] `038-server-package.md` — Hono server, REST routes for workspaces/profiles/launcher/AIDF, token auth, CORS
- [ ] `039-websocket-bridge.md` — EventBus → WebSocket bridge, subscription filtering, multi-client
- [ ] `040-remote-approval.md` — POST /api/approvals/:id, broadcast to clients, first-response-wins
- [ ] `041-server-cli.md` — `ditloop server start/stop/status`, daemon, PID file, TUI indicator

**038 first, then 039-041 parallelizable**

### Remote Execution (042-044)

Execute and monitor tasks remotely.

- [ ] `042-execution-api.md` — POST /api/execute, POST /api/launch, GET /api/executions, SSE stream, cancel
- [ ] `043-execution-monitor.md` — ExecutionMonitor: track active/queued, rate limiting per provider, FIFO queue
- [ ] `044-execution-dashboard-view.md` — TUI dashboard: table of all executions, real-time, cancel/retry

**042 and 043 parallelizable, 044 depends on both**

## API Overview

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/workspaces | List all workspaces |
| GET | /api/workspaces/:id | Get workspace detail with git status |
| GET | /api/workspaces/:id/aidf | Get AIDF context for workspace |
| GET | /api/profiles | List all profiles |
| GET | /api/profiles/current | Get active profile |
| POST | /api/launch | Launch AI CLI in non-interactive mode |
| GET | /api/launch/available | List available AI CLIs |
| POST | /api/execute | Start execution via ExecutionEngine |
| GET | /api/executions | List executions (filter by workspace/status) |
| GET | /api/executions/:id | Get execution detail |
| GET | /api/executions/:id/stream | SSE stream of execution output |
| POST | /api/executions/:id/cancel | Cancel running execution |
| GET | /api/approvals | List pending approvals |
| POST | /api/approvals/:id | Submit approval response (approve/reject) |
| GET | /api/executions/stats | Execution metrics |
| GET | /api/health | Server health check |

### WebSocket Events

Clients connect to `ws://localhost:9847/ws` and subscribe to event patterns:

```json
{ "subscribe": ["workspace:*", "git:*", "approval:*", "execution:*", "launcher:*"] }
```

## Dependencies

- Hono (HTTP server — lightweight, fast, TypeScript-native)
- `ws` (WebSocket)
- v0.3 complete (launcher, AIDF authoring)
- v0.2 complete (executor, safety, providers)
- Config already has `server: { enabled, port, host }` in schema

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Port conflicts | Medium | High | Check availability, configurable, fallback to random |
| Approval race conditions | Medium | Medium | Atomic first-write-wins, reject duplicates |
| Memory leak with many WebSocket clients | Low | Medium | Max 10 clients, auto-unsubscribe on disconnect |
| Server crash leaves stale PID | Medium | Low | Validate PID on start, cleanup stale |
| Long tasks block shutdown | Medium | Medium | Graceful shutdown: 30s wait then force-kill |
| Non-interactive CLI launch via API has limited output | Medium | Medium | Capture stdout/stderr, stream via SSE |

## Success Criteria

- [ ] Server starts/stops cleanly via CLI
- [ ] REST endpoints return correct JSON for workspaces, profiles, AIDF
- [ ] POST /api/launch triggers AI CLI in non-interactive mode
- [ ] WebSocket clients receive events in <100ms
- [ ] Remote approval works from any client
- [ ] SSE streams execution output in real-time
- [ ] Rate limiting queues excess tasks correctly
- [ ] Execution dashboard shows live state
- [ ] Token auth blocks unauthorized requests
- [ ] All tests pass
