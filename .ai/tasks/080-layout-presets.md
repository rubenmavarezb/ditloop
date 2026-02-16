# TASK: Layout presets (Default, Code Focus, AI Focus, Git Focus, Zen)

## Goal
Implement the 5 layout modes as designed in the SuperDesign mockups. Each preset defines which panels are visible, their sizes, and their arrangement.

## Scope

### Allowed
- packages/desktop/src/components/Layout/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Default: All panels visible — sidebar (260px), center (flexible), bottom (300px), right (300px)
2. Code Focus: Explorer only (200px), editor maximized, terminal short (200px), right hidden
3. AI Focus: Agent Plan sidebar, AI Chat as main content, execution logs bottom, source control narrow
4. Git Focus: Explorer as file list, diff viewer center, commit history bottom, source control expanded (350px)
5. Zen: Everything hidden except center content + minimal terminal, breadcrumb + Quick Open only
6. Layout selector in top bar: icon buttons or dropdown
7. Animated transitions between layouts (panels slide, fade, resize)
8. Keyboard shortcuts: Cmd+1 through Cmd+5 for each layout
9. Remember last used layout per workspace

## Definition of Done
- [ ] 5 preset configurations
- [ ] LayoutSelector component in top bar
- [ ] CSS transitions for panel show/hide/resize
- [ ] Integration with layout engine (Task 071)
- [ ] Keyboard shortcut registration
- [ ] All 5 layouts match the SuperDesign mockups
- [ ] Switching is smooth (no flicker)

## Metadata
- **Version**: v0.8
- **Phase**: Phase 4: Layout & Themes
- **Priority**: medium
- **Package**: @ditloop/desktop

## Status: 📋 Planned
