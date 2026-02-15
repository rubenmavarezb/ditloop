# TASK: Action Executor

## Goal
Safely execute approved actions with validation, sandboxing, and rollback.

## Scope

### Allowed
- packages/core/src/safety/action-executor.ts
- packages/core/src/safety/action-executor.test.ts
- packages/core/src/safety/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ActionExecutor class: execute(action) → ExecutionResult, rollback(id)
2. File writes with backup (copy original to temp before write)
3. Shell commands via execa with timeout (30s), cwd = workspace
4. Git operations delegate to git module
5. Blocks dangerous commands (rm -rf /, sudo, etc.)
6. Emits action:executed, action:failed, action:rolled-back

## Definition of Done
- [ ] Executes file writes with backup
- [ ] Shell commands run with timeout
- [ ] Git operations delegate correctly
- [ ] Rollback restores original file
- [ ] Dangerous commands blocked
- [ ] Events emitted on execution/failure/rollback
- [ ] Tests pass

## Status: ✅ Done
