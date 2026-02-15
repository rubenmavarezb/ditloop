# TASK: Session Picker View

## Goal
Build SessionPickerView in TUI to list, preview, resume, delete, and create chat sessions for the current workspace.

## Scope

### Allowed
- packages/tui/src/views/Session/SessionPickerView.tsx
- packages/tui/src/views/Session/SessionPickerView.test.tsx
- packages/tui/src/views/Session/index.ts

### Forbidden
- packages/core/**
- packages/ui/**

## Requirements
1. List all sessions for current workspace with metadata
2. Show preview of last 3 messages
3. Keyboard shortcuts: arrows=navigate, Enter=resume, Delete=delete, n=new
4. Display session age, message count, associated task
5. Confirm before deletion
6. Group by status (active, archived)

## Definition of Done
- [ ] Session list renders with all metadata
- [ ] Preview shows last messages
- [ ] All keyboard shortcuts functional
- [ ] Deletion requires confirmation
- [ ] Component tests for all actions

## Status: 📋 Planned
