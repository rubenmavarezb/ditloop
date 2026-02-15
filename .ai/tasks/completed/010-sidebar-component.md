# TASK: Sidebar Component

## Goal
Build the persistent sidebar that shows all workspaces with their projects and tasks, including real-time status indicators.

## Scope

### Allowed
- packages/ui/src/composite/Sidebar.tsx
- packages/ui/src/composite/WorkspaceItem.tsx
- packages/ui/src/composite/TaskItem.tsx
- packages/ui/src/data-display/RelativeTime.tsx
- packages/ui/src/hooks/useScrollable.ts
- packages/ui/src/input/SelectList.tsx
- packages/playground/src/stories/composite/Sidebar.story.tsx

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Sidebar component: fixed-width left panel with scrollable content
2. WorkspaceItem: collapsable entry with status indicator, project count
3. TaskItem: task entry with status, title, relative time
4. Keyboard navigation: ↑↓ to move, → to expand, ← to collapse
5. Status indicators: 🟢🟡⚪🔴 for workspaces, ●✓○ for tasks
6. Collapsable with ctrl+b
7. RelativeTime component ("now", "12m", "1d", "3w")
8. Story in playground showing full sidebar with mock data

## Definition of Done
- [ ] Sidebar renders workspace tree correctly
- [ ] Keyboard navigation works (up/down/expand/collapse)
- [ ] Status indicators update correctly
- [ ] Relative times display correctly
- [ ] Story exists with realistic mock data
- [ ] pnpm test passes

## Status: ⬜ Pending
