# TASK: Offline mode + sync queue

## Goal
App works offline with cached data and queued actions that sync when connection returns.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Service Worker caches workspace list, recent sessions, approval queue
2. Offline indicator banner
3. Offline actions queued: approve, reject, send instruction
4. On reconnect: sync queue in order with toast notification
5. Conflict resolution: skip already-handled approvals
6. Last-synced timestamp on workspace cards

## Definition of Done
- [ ] App loads cached data when offline
- [ ] Actions queue correctly
- [ ] Sync on reconnect works
- [ ] Conflict resolution handles duplicates
- [ ] Last-synced timestamp visible

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 5: Polish
- **Priority**: medium
- **Package**: @ditloop/mobile
- **Plan task ID**: M12

## Status: planned
