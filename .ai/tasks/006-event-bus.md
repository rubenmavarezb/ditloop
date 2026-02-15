# TASK: Typed Event Bus

## Goal
Implement the central event bus that enables communication between core modules and UI without direct coupling.

## Scope

### Allowed
- packages/core/src/events/**

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. EventBus class wrapping eventemitter3 with full TypeScript generics
2. Type-safe emit() and on() — only valid event names and payloads
3. All event types defined in events.ts (execution, approval, identity, workspace, git, chat, provider)
4. Singleton pattern or dependency injection friendly
5. Methods: emit(), on(), off(), once()

## Definition of Done
- [ ] EventBus is fully typed — wrong event names or payloads cause TS errors
- [ ] All event types defined for v0.1 scope
- [ ] Tests verify type safety and event delivery
- [ ] pnpm test passes

## Status: ⬜ Pending
