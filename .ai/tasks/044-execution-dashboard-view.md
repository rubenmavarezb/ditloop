# TASK: Execution Dashboard View

## Goal
Build ExecutionDashboard in TUI showing table of all executions with real-time updates and interactive controls.

## Scope

### Allowed
- packages/tui/src/views/ExecutionDashboard/ExecutionDashboard.tsx
- packages/tui/src/views/ExecutionDashboard/ExecutionDashboard.test.tsx
- packages/tui/src/views/ExecutionDashboard/index.ts

### Forbidden
- packages/core/**

## Requirements
1. Table with columns: ID, workspace, status, started, duration, exit code
2. Real-time updates via WebSocket events
3. Keyboard shortcuts: Enter=detail, c=cancel, r=retry, f=filter
4. Status indicators: running (spinner), success (green), failed (red), queued (yellow)
5. Filter by workspace and status
6. Sort by start time, duration, status

## Definition of Done
- [ ] Dashboard renders execution table
- [ ] Real-time updates working
- [ ] All keyboard shortcuts functional
- [ ] Filtering and sorting working
- [ ] Component tests for all interactions

## Status: 📋 Planned
