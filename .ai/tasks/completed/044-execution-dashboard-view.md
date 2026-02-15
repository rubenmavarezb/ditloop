# TASK: Execution Dashboard View

## Goal
Build ExecutionDashboard TUI view showing table of all executions with real-time updates from server and interactive controls.

## Scope

### Allowed
- packages/tui/src/views/ExecutionDashboard/ExecutionDashboard.tsx
- packages/tui/src/views/ExecutionDashboard/ExecutionDashboard.test.tsx
- packages/tui/src/views/ExecutionDashboard/index.ts
- packages/tui/src/views/index.ts (add export)
- packages/tui/src/navigation/router.ts (add route)
- packages/tui/src/app.tsx (add route handler)

### Forbidden
- packages/core/** (use server API/WebSocket only)
- packages/server/** (consume API only)

## Requirements
1. Table with columns: ID, workspace, status, started, duration, exit code
2. Real-time updates via WebSocket subscription to `execution:*` events
3. Status indicators: running (spinner), success (green), failed (red), queued (yellow)
4. Keyboard shortcuts: Enter=view detail/output, c=cancel, r=retry, f=filter, q=quit
5. Filter by workspace and status
6. Sort by start time (default), duration, status
7. Show server connection status indicator
8. Auto-refresh when server reconnects

## Definition of Done
- [ ] Dashboard renders execution table with all columns
- [ ] Real-time updates via WebSocket work
- [ ] All keyboard shortcuts functional
- [ ] Filtering and sorting working
- [ ] Server connection indicator displayed
- [ ] Component tests with ink-testing-library

## Status: 📋 Planned
