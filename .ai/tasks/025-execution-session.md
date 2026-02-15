# TASK: Execution Session

## Goal
Manage multi-turn execution sessions with history, action tracking, and persistence.

## Scope

### Allowed
- packages/core/src/executor/execution-session.ts
- packages/core/src/executor/execution-session.test.ts
- packages/core/src/executor/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ExecutionSession class: sessionId, task, messages[], actions[], status
2. Methods: addMessage(), proposeAction(), approveAction(), rejectAction(), pause(), resume()
3. Persists to ~/.ditloop/sessions/{sessionId}.json
4. Emits session:updated on state changes
5. Load from disk with ExecutionSession.load(id)

## Definition of Done
- [ ] Session lifecycle works (create, update, pause, resume)
- [ ] Persists to disk correctly
- [ ] Loads from disk correctly
- [ ] Multi-turn conversation tracked
- [ ] Events emitted on state changes
- [ ] Tests pass

## Status: ⏳ Pending
