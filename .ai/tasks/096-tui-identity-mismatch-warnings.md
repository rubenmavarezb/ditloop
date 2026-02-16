# TASK: TUI identity mismatch warnings

## Goal
Warn when git identity doesn't match workspace's configured profile in the TUI.

## Scope

### Allowed
- packages/tui/src/
- packages/ui/src/

### Forbidden
- packages/core/** (use existing IdentityGuard)
- packages/desktop/**

## Requirements
1. On workspace switch: compare active identity with workspace profile
2. Sidebar: orange dot on mismatched workspace
3. Source Control: warning banner above commit input
4. Status bar: orange warning segment
5. Quick fix: [!] Switch to correct identity
6. Auto-switch option: always switch identity on workspace change

## Definition of Done
- [ ] Mismatch detected on workspace switch
- [ ] Warnings in 3 locations (sidebar, source control, status bar)
- [ ] Quick fix action works
- [ ] Auto-switch setting
- [ ] Tests for mismatch detection

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 2: Enhanced Panels
- **Priority**: high
- **Package**: @ditloop/tui, @ditloop/ui
- **Plan task ID**: T07
- **Depends on**: 092

## Status: planned
