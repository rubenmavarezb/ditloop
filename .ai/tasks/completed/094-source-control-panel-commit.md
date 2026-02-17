# TASK: Source Control panel with commit input

## Goal
Enhance GitStatusPanel with commit message input, staging actions, stash support, and recent commits.

## Scope

### Allowed
- packages/ui/src/panels/
- packages/ui/src/components/
- packages/tui/src/views/

### Forbidden
- packages/core/** (use existing git APIs)
- packages/desktop/**

## Requirements
1. Commit message text input at top (multi-line, Ctrl+Enter to commit)
2. Current identity display with mismatch warning
3. Staged/unstaged/untracked sections with [+]/[-] actions
4. Stage all / unstage all shortcuts
5. Discard changes with confirmation
6. Recent commits section (last 5, collapsible)
7. Stash section: list, create [S], pop [P]
8. Click file to show diff in center terminal (`git diff <file>`)

## Definition of Done
- [ ] Commit input works with Ctrl+Enter
- [ ] Stage/unstage from keyboard
- [ ] Stash operations work
- [ ] Recent commits visible
- [ ] Identity display with warning
- [ ] Tests for panel interactions

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 2: Enhanced Panels
- **Priority**: high
- **Package**: @ditloop/ui, @ditloop/tui
- **Plan task ID**: T05
- **Depends on**: 091

## Status: planned
