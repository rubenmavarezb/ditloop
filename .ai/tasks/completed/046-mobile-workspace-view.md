# TASK: Mobile Workspace View

## Goal
Build mobile workspace browser with cards, pull-to-refresh, tap navigation, and touch-optimized interactions.

## Scope

### Allowed
- packages/mobile/src/views/Workspaces/**
- packages/mobile/src/components/WorkspaceCard/**

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Workspace cards showing name, project count, last activity
2. Pull-to-refresh to reload workspace list
3. Tap card for detail view: git status, tasks, sessions
4. Touch-optimized (min 44px tap targets)
5. Swipe left for quick actions (archive, delete)
6. Loading and empty states

## Definition of Done
- [ ] Workspace list renders cards
- [ ] Pull-to-refresh working
- [ ] Detail view shows full info
- [ ] All touch interactions responsive
- [ ] Component tests for all gestures

## Status: 📋 Planned
