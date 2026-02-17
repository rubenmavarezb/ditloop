# TASK: TUI Status bar component

## Goal
Single-row status bar showing mode, branch, identity, AIDF, errors, and workspace info.

## Scope

### Allowed
- packages/ui/src/primitives/StatusBar/
- packages/ui/src/components/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Mode indicator: NORMAL (green), INSERT (blue), SEARCH (yellow)
2. Branch with dirty indicator: `branch-name*`
3. Identity: `personal (rubennmavarezb@gmail.com)`
4. Error/warning count: `0E 2W`
5. AIDF status: `AIDF: 2 tasks`
6. Active workspace name
7. Memory usage: `MEM: 450MB`
8. All segments space-separated with dividers
9. Responsive: hide less important segments on narrow terminals

## Definition of Done
- [ ] StatusBar component with all segments
- [ ] Updates in real-time
- [ ] Responsive to terminal width
- [ ] Mode reflects keyboard state
- [ ] Tests for segment rendering

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 2: Enhanced Panels
- **Priority**: medium
- **Package**: @ditloop/ui
- **Plan task ID**: T06
- **Depends on**: 091

## Status: planned
