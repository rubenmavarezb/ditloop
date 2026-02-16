# TASK: Approval Queue screen

## Goal
Centralized view of all pending, approved, and rejected approval requests across all workspaces.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Header: "Approvals" title, notification bell, profile avatar
2. Filter chips: All | Pending | Approved | Rejected
3. Approval cards: workspace name, AI tool badge, file count, time ago, status badge
4. Tap card navigates to Diff Review view
5. Batch actions: "Approve All Pending"
6. Pull-to-refresh
7. Real-time updates: new approvals appear automatically

## Definition of Done
- [ ] Filter chips work correctly
- [ ] Approval cards render with all metadata
- [ ] Navigation to diff review works
- [ ] Real-time updates via WebSocket
- [ ] Batch approve works

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 3: Approval Workflow
- **Priority**: critical
- **Package**: @ditloop/mobile
- **Plan task ID**: M06
- **Depends on**: 112

## Status: planned
