# TASK: Workspace Navigation

## Goal
Wire workspace selection in sidebar to navigate to WorkspaceDetail with proper state and breadcrumb.

## Scope

### Allowed
- packages/tui/src/app.tsx
- packages/tui/src/navigation/*
- packages/tui/src/state/*

### Forbidden
- packages/core/**
- packages/ui/**

## Requirements
1. Enter on workspace in sidebar navigates to WorkspaceDetail
2. Activates workspace in app-store, loads git status + identity + AIDF context
3. Breadcrumb shows: ditloop > workspace > project
4. Escape/Back returns to home, deactivates workspace
5. Updates keyboard handlers for WorkspaceDetail context

## Definition of Done
- [ ] Navigation works bidirectionally (enter/escape)
- [ ] Breadcrumb updates correctly
- [ ] State managed correctly (activate/deactivate)
- [ ] Git status loaded on activation
- [ ] Identity context loaded
- [ ] Tests pass

## Status: ✅ Done
