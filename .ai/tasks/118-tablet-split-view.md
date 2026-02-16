# TASK: Tablet Split View (workspace list + detail)

## Goal
iPad/tablet optimized layout with persistent workspace sidebar and detail panel.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Left panel (30%): workspace list with search, provider badges, identity
2. Right panel (70%): workspace detail with tabs, Git Status + AIDF Context cards side-by-side
3. Status bar at bottom: identity | branch | AI status | connection | errors
4. "Switch Branch" and "Launch AI Assistant" buttons
5. Responsive: switch to single-column below 768px

## Definition of Done
- [ ] Split view renders correctly on iPad
- [ ] Workspace selection updates right panel
- [ ] Status bar shows all segments
- [ ] Responsive breakpoint works
- [ ] 2-column card grid on tablet

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 4: Tablet Layouts
- **Priority**: medium
- **Package**: @ditloop/mobile
- **Plan task ID**: M09
- **Depends on**: 110, 111

## Status: planned
