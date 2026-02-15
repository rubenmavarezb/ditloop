# TASK: CLI Entrypoint & Commands

## Goal
Set up the CLI entrypoint with commands: ditloop (TUI), ditloop init, ditloop workspace, ditloop profile.

## Scope

### Allowed
- packages/tui/src/index.ts
- packages/tui/src/commands/**

### Forbidden
- packages/core/src/**
- packages/ui/src/**

## Requirements
1. Default command (no args): launch the TUI dashboard
2. ditloop init: interactive wizard to create ~/.ditloop/config.yml
3. ditloop workspace add: add a workspace (interactive)
4. ditloop workspace list: list all workspaces
5. ditloop profile add: add a git profile (interactive)
6. ditloop profile list: list all profiles
7. ditloop profile current: show current git identity
8. ditloop --version: show version
9. ditloop --help: show available commands

## Definition of Done
- [ ] ditloop launches TUI
- [ ] ditloop init creates config file
- [ ] ditloop workspace add/list works
- [ ] ditloop profile add/list/current works
- [ ] --version and --help work
- [ ] pnpm build && ditloop --help works

## Status: ⬜ Pending
