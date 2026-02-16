# TASK: Workspace Hub (Home screen)

## Goal
Main mobile screen showing active AI sessions as horizontal scroll cards and all workspaces as a vertical list with provider badges, branch, and identity info.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**
- packages/tui/**

## Requirements
1. Top bar: "DitLoop" title, notification bell with badge, profile avatar (initials)
2. Search bar: filter workspaces by name
3. "Active Sessions" section: horizontal scroll cards
   - Each card: workspace name, branch badge, AI tool icon + name, "Running Xm", green pulse dot
   - Tap card navigates to AI Session view
4. "All Workspaces" section: vertical scrollable list
   - Each row: number, workspace name, branch badge, identity email, provider badge (gh/bb/az)
   - Green dot = clean, orange asterisk = dirty
   - Tap row navigates to Workspace Detail
5. FAB button (+): new workspace or new session
6. Pull-to-refresh for workspace status update

## Definition of Done
- [ ] Active Sessions cards with horizontal scroll
- [ ] Workspace list with all metadata (branch, identity, provider)
- [ ] Search filtering works
- [ ] Navigation to detail/session views
- [ ] Real-time updates via WebSocket
- [ ] Pull-to-refresh

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 1: Core Screens
- **Priority**: critical
- **Package**: @ditloop/mobile
- **Plan task ID**: M01

## Status: planned
