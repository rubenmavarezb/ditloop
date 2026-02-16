# TASK: Tablet Session & Approval (3-panel)

## Goal
Triple-panel tablet layout showing session list, output console, and diff review simultaneously.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Left panel (25%): Active sessions list with workspace, AI tool, status, time
2. Center panel (40%): Output Console with code blocks, approval banners, input bar
3. Right panel (35%): Diff Review with file tabs, unified diff, approve/reject buttons
4. Status bar: branch | identity | API status | AIDF | pending reviews
5. Panel resize handles (drag borders)
6. Keyboard shortcuts with external keyboard (Cmd+Return = approve)

## Definition of Done
- [ ] 3-panel layout renders on tablet landscape
- [ ] Session selection loads output + diff
- [ ] Keyboard shortcuts work with external keyboard
- [ ] Status bar shows all context
- [ ] Panel resize works

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 4: Tablet Layouts
- **Priority**: medium
- **Package**: @ditloop/mobile
- **Plan task ID**: M10
- **Depends on**: 113, 116

## Status: planned
