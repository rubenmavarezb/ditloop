# TASK: Server CLI

## Goal
Implement `ditloop server start/stop/status` commands for managing the server daemon with PID file, logging, and TUI status integration.

## Scope

### Allowed
- packages/tui/src/commands/server.ts
- packages/tui/src/commands/server.test.ts

### Forbidden
- packages/core/**

## Requirements
1. Subcommands: start, stop, status, restart
2. Daemon process with PID file at ~/.ditloop/server.pid
3. Log file at ~/.ditloop/logs/server.log
4. Auto-start option in config
5. TUI server status indicator (connected/disconnected)
6. Graceful shutdown handling

## Definition of Done
- [ ] All server commands functional
- [ ] Daemon process management working
- [ ] PID file created/removed correctly
- [ ] Logs written to file
- [ ] CLI tests for all commands

## Status: 📋 Planned
