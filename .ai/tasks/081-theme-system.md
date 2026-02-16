# TASK: Theme system with 4 built-in themes

## Goal
CSS custom properties-based theme system with 4 built-in themes inspired by the SuperDesign mockup variants.

## Scope

### Allowed
- packages/web-ui/src/theme/
- packages/desktop/src/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. ThemeProvider component using CSS custom properties (--color-bg, --color-accent, etc.)
2. Token categories: colors, typography, spacing, border-radius, shadows
3. Four themes:
   - Neon: teal accent (#06b6d4), dark bg (#0f172a), modern rounded corners, sans-serif labels
   - Brutalist: red accent (#ef4444), dark bg (#111), sharp corners, uppercase headings, monospace everywhere
   - Classic: muted green accent, darker bg, dense spacing, visible keyboard hints
   - Light: light bg (#fafafa), dark text, blue accent, standard IDE feel
4. Theme selector in Settings view
5. Theme persisted in app config (localStorage + optional ditloop config)
6. All components consume theme tokens (no hardcoded colors anywhere)
7. Terminal theme syncs with app theme (xterm.js theme object)
8. Syntax highlighting theme matches app theme

## Definition of Done
- [ ] ThemeProvider with CSS custom properties
- [ ] 4 theme definition files
- [ ] Theme selector component
- [ ] All existing components migrated to use tokens
- [ ] Tests for theme switching
- [ ] Theme switch is instant (no page reload)
- [ ] Terminal colors match app theme

## Metadata
- **Version**: v0.8
- **Phase**: Phase 4: Layout & Themes
- **Priority**: medium
- **Package**: @ditloop/desktop, @ditloop/web-ui

## Status: 📋 Planned
