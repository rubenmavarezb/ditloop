# TASK: Push notifications for approvals

## Goal
Native push notifications when AI sessions need human approval, even when app is closed.

## Scope

### Allowed
- packages/mobile/src/
- packages/server/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. VAPID-based Web Push notifications (enhance existing v0.5)
2. Notification types: approval needed, session paused, session completed
3. Tap notification deep links to approval view
4. Notification grouping by workspace
5. Quiet hours setting
6. Per-workspace notification preferences

## Definition of Done
- [ ] Push notifications arrive when app is closed
- [ ] Tap opens correct approval
- [ ] Notification grouping works
- [ ] Quiet hours setting works
- [ ] Per-workspace preferences

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 5: Polish
- **Priority**: high
- **Package**: @ditloop/mobile, @ditloop/server
- **Plan task ID**: M11
- **Depends on**: 115

## Status: planned
