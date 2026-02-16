# TASK: Session instruction input + controls

## Goal
Send instructions to running AI session from mobile, and control session (pause/resume/stop).

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Input bar at bottom: text field, attach button, send arrow
2. Send instruction forwarded to AI CLI session via server
3. Session controls in "..." menu: Pause, Resume, Stop, Restart
4. Keyboard avoidance: input stays visible when keyboard is open
5. Instruction history (swipe up to see previous)

## Definition of Done
- [ ] Input sends instructions to server -> AI session
- [ ] Session control actions work
- [ ] Keyboard avoidance correct on iOS + Android
- [ ] Instruction history accessible

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 2: AI Sessions
- **Priority**: high
- **Package**: @ditloop/mobile
- **Plan task ID**: M05
- **Depends on**: 113

## Status: planned
