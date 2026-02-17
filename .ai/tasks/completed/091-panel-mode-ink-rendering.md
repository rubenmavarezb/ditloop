# TASK: Panel-mode Ink rendering

## Goal
Run DitLoop Ink app in "panel mode" -- renders only specific panels (sidebar OR git status) designed to fit in a narrow tmux pane.

## Scope

### Allowed
- packages/tui/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. New CLI flag: `ditloop --panel <sidebar|git|status>`
2. Sidebar panel mode: renders workspace list + AIDF context only
3. Git panel mode: renders Source Control panel only
4. Status panel mode: renders status bar only (1 row)
5. Panels communicate via IPC or shared file (workspace changes, git updates)
6. Panels auto-resize to fit tmux pane dimensions (use `process.stdout.columns/rows`)
7. Panels react to SIGWINCH for resize events

## Definition of Done
- [ ] `--panel` CLI flag works
- [ ] Sidebar renders correctly in 30-col pane
- [ ] Git panel renders correctly in 30-col pane
- [ ] Panels update when workspace changes
- [ ] Resize handling works
- [ ] Tests for panel mode rendering

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 1: tmux Foundation
- **Priority**: critical
- **Package**: @ditloop/tui
- **Plan task ID**: T02
- **Depends on**: 090

## Status: planned
