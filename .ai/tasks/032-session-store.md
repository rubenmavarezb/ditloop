# TASK: Session Store

## Goal
Implement SessionStore for CRUD operations on chat sessions, persisting to JSON files with auto-save and event emission.

## Scope

### Allowed
- packages/core/src/session/session-store.ts
- packages/core/src/session/session-store.test.ts
- packages/core/src/session/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. CRUD for sessions: id, workspaceId, taskId, messages, status, timestamps
2. Store as JSON in ~/.ditloop/sessions/{workspaceId}/{sessionId}.json
3. Auto-save with debouncing (500ms default)
4. Emit events: session:created, session:updated, session:deleted
5. List sessions by workspace with filtering and sorting
6. Handle concurrent access safely

## Definition of Done
- [ ] All CRUD operations functional
- [ ] Auto-save with configurable debounce
- [ ] Events emitted correctly
- [ ] File-based storage with atomic writes
- [ ] Unit tests including concurrency scenarios

## Status: 📋 Planned
