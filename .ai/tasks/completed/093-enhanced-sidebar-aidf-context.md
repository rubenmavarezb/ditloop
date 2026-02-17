# TASK: Enhanced sidebar with AIDF context

## Goal
Upgrade sidebar to show workspace list with git provider badges, AIDF context section, and quick actions.

## Scope

### Allowed
- packages/ui/src/components/
- packages/tui/src/views/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Workspace entries show: number, name, branch, identity email, provider badge (gh/bb/az)
2. Active workspace highlighted with `>` and green color
3. Dirty branch indicator (`*` after branch name)
4. AIDF context section below workspaces: loaded role, task, plan
5. Quick actions: [n] New, [c] Clone, [s] Switch, [l] Launch AI
6. [E] toggle to Explorer mode (file tree of active workspace)
7. Scrollable workspace list for 10+ projects

## Definition of Done
- [ ] Provider badges render (gh/bb/az)
- [ ] AIDF context section with loaded files
- [ ] Quick actions functional
- [ ] Explorer toggle works
- [ ] Scroll for long workspace lists
- [ ] Tests for sidebar rendering

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 2: Enhanced Panels
- **Priority**: high
- **Package**: @ditloop/ui, @ditloop/tui
- **Plan task ID**: T04
- **Depends on**: 091

## Status: planned
