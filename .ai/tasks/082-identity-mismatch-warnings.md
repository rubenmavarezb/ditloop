# TASK: Git identity mismatch warnings

## Goal
Detect when the active git identity doesn't match a workspace's configured profile and show prominent warnings to prevent committing with the wrong identity.

## Scope

### Allowed
- packages/desktop/src/hooks/
- packages/desktop/src/components/

### Forbidden
- packages/core/** (use existing IdentityGuard)
- packages/tui/**

## Requirements
1. On workspace tab activation: compare current git email with workspace's configured profile email
2. Warning locations:
   - Workspace tab: orange dot instead of green
   - Sidebar workspace card: orange border + warning icon
   - Source Control panel: warning banner above commit button
   - Status bar: orange "Identity mismatch" segment
3. Quick fix action: "Switch to {correct-profile}" button
4. Auto-switch option in settings: automatically switch identity when changing workspace tabs
5. Use @ditloop/core's IdentityGuard for detection
6. Warning dismissible per session

## Definition of Done
- [ ] IdentityMismatch hook and components
- [ ] Integration with IdentityGuard from core
- [ ] Warning UI in 4 locations
- [ ] Auto-switch logic
- [ ] Tests for mismatch detection
- [ ] "Switch identity" button works and clears warning

## Metadata
- **Version**: v0.8
- **Phase**: Phase 5: Polish
- **Priority**: high
- **Package**: @ditloop/desktop

## Status: 📋 Planned
