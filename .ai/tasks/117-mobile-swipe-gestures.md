# TASK: Swipe gestures + approve/reject actions

## Goal
Natural gesture-based approval workflow with haptic feedback, animations, and undo support.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Swipe right on approval card -> approve (green slide animation)
2. Swipe left on approval card -> reject (red slide animation)
3. Haptic feedback on swipe threshold
4. Undo toast: "Approved ditloop changes. Undo?" (5 second timeout)
5. Swipe on individual files in diff view
6. Long press on approval card -> context menu
7. Gesture tutorial on first use

## Definition of Done
- [ ] Swipe gestures on approval cards
- [ ] Swipe gestures on diff files
- [ ] Haptic feedback works
- [ ] Undo toast with timer
- [ ] First-use tutorial

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 3: Approval Workflow
- **Priority**: high
- **Package**: @ditloop/mobile
- **Plan task ID**: M08
- **Depends on**: 116

## Status: planned
