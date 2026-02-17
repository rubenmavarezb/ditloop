# TASK: 5 tmux layout presets

## Goal
Implement 5 tmux layouts switchable with Ctrl+1 through Ctrl+5.

## Scope

### Allowed
- packages/tui/src/tmux/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. **Default**: sidebar (25%) | terminal (50%) | git (25%)
2. **Code Focus**: collapsed sidebar (thin strip) | terminal (80%) | collapsed git (thin strip)
3. **Git Focus**: file tree (20%) | diff viewer terminal (50%) | expanded git (30%)
4. **Multi-Terminal**: sidebar (20%) | 2 terminals split vertically (50%) | stacked git (30%)
5. **Zen**: terminal only (100%), status bar hidden, one key to toggle back
6. Ctrl+1-5 switches layouts via tmux resize/split commands
7. Current layout shown in status bar
8. Layout persisted per session

## Definition of Done
- [ ] All 5 layouts work via tmux commands
- [ ] Keyboard shortcuts switch layouts
- [ ] Pane sizes correct per layout
- [ ] Layout indicator in status bar
- [ ] Tests for layout switching

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 3: Layout Presets
- **Priority**: medium
- **Package**: @ditloop/tui
- **Plan task ID**: T08
- **Depends on**: 090

## Status: planned
