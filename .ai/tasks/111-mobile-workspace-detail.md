# TASK: Workspace Detail view

## Goal
Per-workspace detail screen with tabs for overview, git, AIDF, and sessions.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Header: back arrow, workspace name, branch badge, "..." menu
2. Context chips: identity chip, AIDF tasks chip, provider chip
3. Tab bar: Overview | Git | AIDF | Sessions
4. Overview tab: Git Status card (progress bar + counts), Recent Commits (3-5), AIDF Context card, Quick actions (Launch AI, Commit, Push)
5. Git tab: full file list with staged/unstaged/untracked sections
6. AIDF tab: roles, tasks, plans loaded for this workspace
7. Sessions tab: list of AI sessions (active + recent)

## Definition of Done
- [ ] All 4 tabs render correctly
- [ ] Git status updates in real-time
- [ ] Quick actions trigger server API calls
- [ ] AIDF context loads from workspace
- [ ] Recent commits display correctly

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 1: Core Screens
- **Priority**: critical
- **Package**: @ditloop/mobile
- **Plan task ID**: M02

## Status: planned
