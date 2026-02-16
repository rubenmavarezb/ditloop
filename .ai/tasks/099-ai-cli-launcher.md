# TASK: AI CLI launcher with context injection

## Goal
`ditloop launch` command that starts an AI CLI in the center terminal with AIDF context auto-injected.

## Scope

### Allowed
- packages/tui/src/commands/
- packages/tui/src/tmux/

### Forbidden
- packages/desktop/**

## Requirements
1. `[l]` in sidebar opens launcher overlay: select AI CLI + AIDF task
2. DitLoop builds context string from AIDF (roles, tasks, plans)
3. Sends command to center terminal: `claude --context <file>` or generates temp CLAUDE.md
4. For Aider: generates `.aider.conf.yml` with context
5. For generic CLIs: copies context to clipboard with notification
6. Workspace path, git identity, and AIDF context all pre-configured

## Definition of Done
- [ ] Launcher overlay works
- [ ] Claude Code launched with AIDF context
- [ ] At least 2 AI CLIs supported
- [ ] Context injection verified
- [ ] Tests for launcher flow

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 4: Polish
- **Priority**: medium
- **Package**: @ditloop/tui
- **Plan task ID**: T10
- **Depends on**: 092

## Status: planned
