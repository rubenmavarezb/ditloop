# TASK: Workspace context switching via tmux

## Goal
When user selects a different workspace in the sidebar, DitLoop updates the center terminal pane and all side panels.

## Scope

### Allowed
- packages/tui/src/tmux/
- packages/tui/src/views/
- packages/tui/src/hooks/

### Forbidden
- packages/core/** (use existing APIs)
- packages/desktop/**

## Requirements
1. Sidebar selection (j/k + Enter) triggers workspace switch
2. DitLoop sends to center terminal: `cd /path/to/workspace` + Enter
3. DitLoop switches git identity: `git config user.email` (via core ProfileManager)
4. Right panel refreshes: new git status, branches, commits
5. Sidebar updates: active indicator moves, AIDF context reloads
6. Status bar updates: branch, identity, AIDF status
7. IPC between sidebar and git panel processes (or single process managing both)

## Definition of Done
- [ ] Workspace switch updates center terminal cd
- [ ] Git identity switches automatically
- [ ] Side panels refresh with new workspace data
- [ ] Status bar reflects current workspace
- [ ] No flicker during switch
- [ ] Tests for workspace switching flow

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 1: tmux Foundation
- **Priority**: high
- **Package**: @ditloop/tui
- **Plan task ID**: T03
- **Depends on**: 090, 091

## Status: planned
