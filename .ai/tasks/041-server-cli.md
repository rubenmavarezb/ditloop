# TASK: Server CLI

## Goal
Implement `ditloop server start/stop/status` commands for managing the server daemon with PID file, logging, and TUI status integration.

## Scope

### Allowed
- packages/tui/src/commands/server.ts
- packages/tui/src/commands/server.test.ts

### Forbidden
- packages/core/** (import only)
- packages/server/** (spawn as child process only)

## Requirements
1. Subcommands: `ditloop server start`, `stop`, `status`, `restart`
2. `start` — spawn server as detached daemon process, write PID to `~/.ditloop/server.pid`
3. `stop` — read PID file, send SIGTERM, wait for graceful shutdown (30s), then SIGKILL
4. `status` — check if PID is alive, show port/uptime/connections
5. `restart` — stop then start
6. Log file at `~/.ditloop/logs/server.log` with rotation
7. Validate stale PID on start (process died without cleanup)
8. TUI status indicator component showing server state (connected/disconnected/starting)

## Definition of Done
- [ ] All server subcommands functional
- [ ] Daemon process management working
- [ ] PID file created on start, removed on stop
- [ ] Stale PID detection works
- [ ] Logs written to file
- [ ] TUI indicator shows server state
- [ ] CLI tests for all commands

## Status: 📋 Planned
