# TASK: AIDF context manager

## Goal
Visual manager for AIDF context per workspace. Shows loaded roles, tasks, plans, and allows editing which context files are active for AI interactions.

## Scope

### Allowed
- packages/desktop/src/components/AidfContext/

### Forbidden
- packages/core/** (use existing AIDF detector and context loader)
- packages/tui/**

## Requirements
1. Collapsible context card showing: Active Role, Current Task, Active Plan, loaded files
2. Auto-detect .ai/ folder contents using @ditloop/core AIDF detector
3. Select/deselect which AIDF files to include in AI context
4. "Edit Context" opens file list with checkboxes
5. "Add Context" to attach non-AIDF files (any file from workspace)
6. Context badge in AI Chat header (summary: "2 files, 1 role")
7. Loaded Knowledge tags (e.g., "NodeJS Runtime", "Retry-Patterns.md")
8. Per-workspace context persistence
9. Quick switch between AIDF tasks
10. Preview AIDF file content inline

## Definition of Done
- [ ] AidfContextManager component
- [ ] Integration with @ditloop/core AIDF detector and context loader
- [ ] Context store (Zustand)
- [ ] Tests for context loading and selection
- [ ] Detects and displays .ai/ contents for workspace
- [ ] Can toggle context files on/off
- [ ] Context changes reflect immediately in AI Chat

## Metadata
- **Version**: v0.8
- **Phase**: Phase 3: AI Integration
- **Priority**: high
- **Package**: @ditloop/desktop

## Status: 📋 Planned
