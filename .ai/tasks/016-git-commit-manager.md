# TASK: Git Commit Manager

## Goal
Handle staging files and creating commits with conventional commit format and identity validation.

## Scope

### Allowed
- packages/core/src/git/git-commit-manager.ts
- packages/core/src/git/git-commit-manager.test.ts
- packages/core/src/git/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. GitCommitManager class with stageFiles(), unstageFiles(), commit(), amendCommit()
2. Validates identity via IdentityGuard before commit
3. Conventional commit format validation (type(scope): subject)
4. Emits `git:commit` with commit hash
5. Dry-run mode support

## Definition of Done
- [ ] Can stage and unstage files in test repo
- [ ] Commit creates commits successfully
- [ ] Identity validated before commit
- [ ] Conventional format enforced
- [ ] Dry-run mode works
- [ ] Tests pass

## Status: ⏳ Pending
