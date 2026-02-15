# TASK: Task Editor View

## Goal
Create TUI form editor for creating and editing AIDF tasks with preview mode and template integration.

## Scope

### Allowed
- packages/tui/src/views/TaskEditor/TaskEditorView.tsx
- packages/tui/src/views/TaskEditor/TaskEditorView.test.tsx
- packages/tui/src/views/TaskEditor/index.ts
- packages/tui/src/views/index.ts (add export)
- packages/tui/src/navigation/router.ts (add route)

### Forbidden
- packages/core/** (use AidfWriter + TemplateEngine only)

## Requirements
1. Form fields for all AIDF task sections: title, goal, scope, requirements, DoD, status
2. Template selection dropdown to pre-fill fields
3. Preview mode showing rendered markdown
4. Save writes to .ai/tasks/ via AidfWriter
5. Edit mode loads existing task file
6. Keyboard: Tab between fields, Ctrl+S save, Ctrl+P toggle preview, Esc cancel

## Definition of Done
- [ ] Form renders all task fields
- [ ] Template pre-fill works
- [ ] Preview mode shows rendered output
- [ ] Save and edit operations work
- [ ] Component tests with ink-testing-library

## Status: 📋 Planned
