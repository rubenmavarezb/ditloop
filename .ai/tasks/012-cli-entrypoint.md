# TASK: CLI Entrypoint & Commands

## Goal
Set up the CLI entrypoint with commands: hitloop (TUI), hitloop init, hitloop workspace, hitloop profile.

## Scope

### Allowed
- packages/tui/src/index.ts
- packages/tui/src/commands/**

### Forbidden
- packages/core/src/**
- packages/ui/src/**

## Requirements
1. Default command (no args): launch the TUI dashboard
2. hitloop init: interactive wizard to create ~/.hitloop/config.yml
3. hitloop workspace add: add a workspace (interactive)
4. hitloop workspace list: list all workspaces
5. hitloop profile add: add a git profile (interactive)
6. hitloop profile list: list all profiles
7. hitloop profile current: show current git identity
8. hitloop --version: show version
9. hitloop --help: show available commands

## Definition of Done
- [ ] hitloop launches TUI
- [ ] hitloop init creates config file
- [ ] hitloop workspace add/list works
- [ ] hitloop profile add/list/current works
- [ ] --version and --help work
- [ ] pnpm build && hitloop --help works

## Status: ⬜ Pending
