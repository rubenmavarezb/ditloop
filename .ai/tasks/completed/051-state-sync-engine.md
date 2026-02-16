# TASK: State Sync Engine

## Goal
Create StateSyncEngine for delta updates over WebSocket with optimistic updates, conflict resolution, and offline queue support.

## Scope

### Allowed
- packages/server/src/sync/state-sync-engine.ts
- packages/server/src/sync/state-sync-engine.test.ts

### Forbidden
- packages/core/**
- packages/mobile/**

## Requirements
1. Delta updates over WebSocket (only changed fields)
2. Optimistic updates with server reconciliation
3. Conflict resolution: first-write-wins for approvals, append-only for messages
4. Offline event queue (max 100 events, FIFO eviction)
5. Sync on reconnection with delta catch-up
6. Version vectors for conflict detection

## Definition of Done
- [ ] Delta updates sent correctly
- [ ] Optimistic updates reconciled
- [ ] Conflict resolution working
- [ ] Offline queue with eviction
- [ ] Integration tests for all sync scenarios

## Status: 📋 Planned
