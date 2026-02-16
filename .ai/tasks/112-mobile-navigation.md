# TASK: Bottom navigation + routing

## Goal
Tab-based navigation with 4 sections: Home, Sessions, Approvals, Settings.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Bottom tab bar: Home, Sessions, Approvals (with badge), Settings
2. Approvals badge shows pending count (red/orange dot with number)
3. React Router navigation between sections
4. Preserve scroll position when switching tabs
5. Deep linking support: `ditloop://approvals/123`

## Definition of Done
- [ ] 4-tab navigation works
- [ ] Badge count updates in real-time
- [ ] Deep linking works
- [ ] Scroll position preserved
- [ ] Correct icons and active states

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 1: Core Screens
- **Priority**: critical
- **Package**: @ditloop/mobile
- **Plan task ID**: M03

## Status: planned
