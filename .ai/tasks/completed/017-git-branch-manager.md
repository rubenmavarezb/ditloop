# TASK: Git Branch Manager

## Goal
Manage branches including creation, switching, deletion, and remote operations.

## Scope

### Allowed
- packages/core/src/git/git-branch-manager.ts
- packages/core/src/git/git-branch-manager.test.ts
- packages/core/src/git/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. GitBranchManager class with listBranches(), createBranch(), switchBranch(), deleteBranch()
2. detectDefaultBranch() checks origin/HEAD then falls back to main/master/develop
3. push() and pull() with identity validation
4. Emits `git:branch` events

## Definition of Done
- [ ] Branch operations work in test repo
- [ ] Default branch detected correctly
- [ ] Push validates identity before pushing
- [ ] Pull operations work
- [ ] Events emitted on branch changes
- [ ] Tests pass

## Status: ✅ Done
