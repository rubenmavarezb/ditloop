# TASK: Enhanced status bar with full context

## Goal
Rich status bar showing all relevant context: git identity, branch, provider, AIDF status, file info, sync status, and layout mode.

## Scope

### Allowed
- packages/desktop/src/components/StatusBar/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Left section: Git identity icon + "profile — email" (clickable: opens identity switcher)
2. Center-left: Branch icon + branch name | git provider icon | ahead/behind indicators
3. Center: AIDF status "AIDF Active: N tasks, N plans" (clickable: opens AIDF manager)
4. Center-right: Errors (red) + Warnings (yellow) count
5. Right: Ln/Col | File type (TypeScript) | Encoding (UTF-8) | Spaces/Tabs
6. Far right: Sync indicator (phone icon + "Mobile connected") | Layout mode badge
7. All sections clickable for quick actions
8. Responsive: collapse less important items on narrow windows

## Definition of Done
- [ ] StatusBar component with all segments
- [ ] Integration with workspace, git, AIDF, and sync stores
- [ ] Click handlers for all interactive segments
- [ ] Responsive breakpoints
- [ ] All segments display correct information
- [ ] Information updates in real-time

## Metadata
- **Version**: v0.8
- **Phase**: Phase 5: Polish
- **Priority**: medium
- **Package**: @ditloop/desktop

## Status: 📋 Planned
