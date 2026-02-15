# TASK: Git Status Reader

## Goal
Read and monitor git repository status including branch info, staged/unstaged/untracked files, and ahead/behind tracking.

## Scope

### Allowed
- packages/core/src/git/git-status-reader.ts
- packages/core/src/git/git-status-reader.test.ts
- packages/core/src/git/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. GitStatusReader class wrapping simple-git status() and branch()
2. Returns GitStatus type: currentBranch, tracking, ahead/behind, staged/unstaged/untracked arrays, isDirty
3. Emits `git:status` on EventBus
4. Poll mode that checks status every 2s (configurable)
5. Handles detached HEAD state gracefully

## Definition of Done
- [ ] Status returns correct data for test repo
- [ ] Events emitted on status changes
- [ ] Poll mode works with configurable interval
- [ ] Detached HEAD handled gracefully
- [ ] Tests pass

## Status: ⏳ Pending
