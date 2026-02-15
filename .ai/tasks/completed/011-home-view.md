# TASK: Home View & App Layout

## Goal
Build the main app layout with persistent sidebar, main content area, command bar, and view routing.

## Scope

### Allowed
- packages/tui/src/app.tsx
- packages/tui/src/views/HomeView.tsx
- packages/tui/src/views/TaskDetailView.tsx
- packages/tui/src/navigation/**
- packages/tui/src/state/**

### Forbidden
- packages/core/src/** (use existing exports)
- packages/ui/src/** (use existing components)

## Requirements
1. App.tsx: root component, wraps with ThemeProvider, initializes core
2. Layout: persistent sidebar (left) + main area (right) + shortcuts bar (bottom)
3. HomeView: welcome screen with quick action cards
4. TaskDetailView: task detail panel when a task is selected in sidebar
5. Router: manages which view shows in the main area
6. NavigationContext: tracks current workspace, project, view
7. AppContext: bridges core (WorkspaceManager, ProfileManager) to UI
8. Keyboard: global shortcuts (1-9 workspace, m mission ctrl, q quit)

## Definition of Done
- [ ] App launches and shows sidebar + welcome screen
- [ ] Workspace navigation works (select workspace → see tasks)
- [ ] Task selection shows detail in main area
- [ ] Global keyboard shortcuts work
- [ ] Profile auto-switch on workspace enter
- [ ] pnpm build && node dist/index.js works

## Status: ⬜ Pending
