# TASK: Enhanced Source Control panel

## Goal
VSCode-like Source Control panel with staging, committing, stash management, and identity awareness.

## Scope

### Allowed
- packages/desktop/src/components/SourceControl/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Three sections: Staged Changes, Changes (unstaged), Untracked
2. Stage/unstage individual files (+ / - buttons)
3. Stage all / unstage all buttons
4. Discard changes per file (with confirmation)
5. Commit message textarea with placeholder
6. Commit button (Ctrl+Enter shortcut) with dropdown: Commit, Commit & Push, Amend
7. Current identity display: "email (profile-name)"
8. Identity mismatch warning when identity doesn't match workspace config
9. Recent commits list (collapsible, last 10)
10. Stash section: list stashes, create stash, pop stash, drop stash
11. Refresh button to re-read git status
12. Click file to open diff viewer

## Definition of Done
- [ ] SourceControl component with all sections
- [ ] Rust commands for git add, reset, commit, stash
- [ ] Integration with workspace tab context
- [ ] Tests for staging/commit logic
- [ ] Can stage, unstage, commit from the panel
- [ ] Identity mismatch shows warning
- [ ] Stash operations work

## Metadata
- **Version**: v0.8
- **Phase**: Phase 2: Core Panels
- **Priority**: high
- **Package**: @ditloop/desktop

## Status: 📋 Planned
