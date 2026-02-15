# TASK: Mobile Approval View

## Goal
Build mobile approval interface with pending approvals list, diff viewer with syntax highlighting, and swipe gestures for approve/reject.

## Scope

### Allowed
- packages/mobile/src/views/Approvals/**
- packages/mobile/src/components/DiffViewer/**

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. List of pending approvals with risk level badges
2. Diff viewer with syntax highlighting (green/red for +/-)
3. Swipe right to approve, swipe left to reject
4. Risk level indicators (low/medium/high/critical)
5. Confirmation dialog for critical operations
6. Timestamp and requester info

## Definition of Done
- [ ] Approval list renders with badges
- [ ] Diff viewer shows changes correctly
- [ ] Swipe gestures trigger approve/reject
- [ ] Confirmation for critical items
- [ ] Component tests for all gestures

## Status: 📋 Planned
