# TASK: Tab-based workspace switching

## Goal
Replace multi-window workspace approach with a tab bar. Each tab represents a workspace with its own full context (file tree, git status, terminal sessions, AI chat history). Switching tabs swaps all panel contents.

## Scope

### Allowed
- packages/desktop/src/components/
- packages/desktop/src/store/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Tab bar component at top of window (below title bar)
2. Each tab shows: color-coded status dot + project name + branch name
3. Active tab has teal underline/highlight
4. Click tab to switch workspace context
5. [+] button to open new workspace
6. Close button (x) on tabs
7. Drag to reorder tabs
8. Per-tab state preservation (scroll position, terminal history, panel sizes)
9. Zustand store: activeTab, tabs[], per-tab state
10. Keyboard: Cmd/Ctrl+Tab to cycle, Cmd+1-9 for direct tab access

## Definition of Done
- [ ] TabBar component with full interaction
- [ ] Workspace tab store
- [ ] Tab context isolation (each tab is independent)
- [ ] Tests for tab state management
- [ ] Can open 3+ workspaces as tabs
- [ ] Switching tabs swaps all panel content
- [ ] State preserved when switching back to a tab

## Metadata
- **Version**: v0.8
- **Phase**: Phase 1: Foundation
- **Priority**: high
- **Package**: @ditloop/desktop

## Status: 📋 Planned
