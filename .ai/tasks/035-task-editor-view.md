# TASK: Task Editor View

## Goal
Build TaskEditorView in TUI with form fields for all task properties, supporting both edit and preview modes.

## Scope

### Allowed
- packages/tui/src/views/TaskEditor/TaskEditorView.tsx
- packages/tui/src/views/TaskEditor/TaskEditorView.test.tsx
- packages/tui/src/views/TaskEditor/index.ts

### Forbidden
- packages/core/**
- packages/ui/**

## Requirements
1. Form fields: title, status, scope (allowed/forbidden), priority, description, requirements, DoD
2. Toggle between Edit and Preview modes
3. Keyboard shortcuts: Ctrl+S=save, Ctrl+P=preview, Esc=cancel
4. Real-time validation with error display
5. Markdown preview for description and requirements
6. Unsaved changes warning

## Definition of Done
- [ ] All form fields functional with validation
- [ ] Edit/Preview toggle working
- [ ] All keyboard shortcuts implemented
- [ ] Markdown preview renders correctly
- [ ] Component tests for validation and saving

## Status: 📋 Planned
