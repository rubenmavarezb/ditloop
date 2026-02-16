# TASK: Desktop layout engine with resizable panels

## Goal
Create a flexible panel layout system for the desktop app using CSS Grid + ResizeObserver. Panels can be shown, hidden, resized, and rearranged. Layout presets define which panels are visible and their sizes.

## Scope

### Allowed
- packages/desktop/src/components/Layout/
- packages/web-ui/src/components/Layout/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Panel registry: each panel has id, defaultSize, minSize, maxSize, position (left|center|right|bottom)
2. CSS Grid-based layout with resizable borders (drag handles)
3. ResizeObserver for responsive behavior
4. Layout state type: `{ panels: Record<string, PanelState>, preset: string }`
5. Persist layout state in localStorage
6. 5 layout presets: Default, Code Focus, AI Focus, Git Focus, Zen
7. Layout selector dropdown in top bar
8. Panels slide in/out with CSS transitions
9. Zustand store for layout state

## Definition of Done
- [ ] LayoutEngine component with preset system
- [ ] Zustand layout store
- [ ] Unit tests for layout state management
- [ ] All presets render correctly
- [ ] Can switch between 5 layout presets
- [ ] Panels resize by dragging borders
- [ ] Layout persists across app restarts
- [ ] No layout shift or jank during resize

## Metadata
- **Version**: v0.8
- **Phase**: Phase 1: Foundation
- **Priority**: high
- **Package**: @ditloop/desktop, @ditloop/web-ui

## Status: 📋 Planned
