# TASK: Workspace Detail View

## Goal
Build the workspace detail view — a developer context dashboard with git status, identity, tasks, and quick actions.

## Scope

### Allowed
- packages/tui/src/views/WorkspaceDetail/WorkspaceDetail.tsx
- packages/tui/src/views/WorkspaceDetail/WorkspaceDetail.test.tsx
- packages/tui/src/views/WorkspaceDetail/index.ts

### Forbidden
- packages/core/**
- packages/ui/** (use existing components)

## Requirements
1. 4-panel layout: Git Status (branch, dirty, ahead/behind), Identity (profile match), AIDF Tasks (grouped by status), Quick Actions (c=commit, p=push, b=branches)
2. Subscribe to git:status events for real-time updates
3. Subscribe to identity:validated events
4. Focus management with Tab between panels
5. Keyboard shortcuts for quick actions

## Definition of Done
- [ ] All 4 panels render with mock data
- [ ] Events update panels in real-time
- [ ] Keyboard navigation works (Tab between panels)
- [ ] Quick action shortcuts work
- [ ] Tests pass

## Status: ✅ Done
