# TASK: Multi-terminal layout

## Goal
Support running terminals for 2+ workspaces simultaneously side-by-side.

## Scope

### Allowed
- packages/tui/src/tmux/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Split center area into 2+ terminal panes
2. Each terminal pane cd'd to a different workspace
3. Git panel shows stacked status for all active terminals
4. Sidebar indicates which workspaces have active terminals
5. Focus cycling between terminal panes (Ctrl+Left/Right)
6. Add/remove terminal splits dynamically

## Definition of Done
- [ ] 2 terminals side-by-side work
- [ ] Each in different workspace
- [ ] Git panel shows both statuses
- [ ] Focus cycling works
- [ ] Tests for multi-terminal management

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 3: Layout Presets
- **Priority**: medium
- **Package**: @ditloop/tui
- **Plan task ID**: T09
- **Depends on**: 097

## Status: planned
