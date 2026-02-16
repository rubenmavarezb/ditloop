# TASK: Diff Review view with file navigation

## Goal
Mobile-optimized unified diff viewer with file tab navigation and per-file approve/reject.

## Scope

### Allowed
- packages/mobile/src/
- packages/web-ui/src/ (shared diff component)

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Header: "Review Changes", file counter "2/3 FILES"
2. File tabs: horizontal scroll, tap to switch
3. Unified diff: line numbers, red removed, green added, gray context, hunk headers
4. Swipe gestures: left = reject, right = approve (with haptic feedback)
5. Gesture hint arrows: REJECT / APPROVE
6. Action buttons: "Reject File", "Approve File", "Approve All Changes"
7. Pinch-to-zoom on diff for small screens

## Definition of Done
- [ ] Unified diff renders correctly with colors
- [ ] File tab navigation works
- [ ] Swipe gestures with haptic feedback
- [ ] Per-file and bulk approve/reject
- [ ] Pinch-to-zoom works

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 3: Approval Workflow
- **Priority**: critical
- **Package**: @ditloop/mobile, @ditloop/web-ui
- **Plan task ID**: M07
- **Depends on**: 115

## Status: planned
