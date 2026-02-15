# TASK: UI Primitive Components

## Goal
Build the base building blocks of the design system: Panel, SplitView, Header, Breadcrumb, StatusBadge, ShortcutsBar, Divider.

## Scope

### Allowed
- packages/ui/src/primitives/**
- packages/ui/src/theme/**
- packages/ui/src/hooks/useTheme.ts
- packages/playground/src/stories/primitives/**

### Forbidden
- packages/core/**
- packages/tui/**
- packages/ui/src/composite/**
- packages/ui/src/data-display/**

## Requirements
1. Panel: bordered box with optional title and status badge
2. SplitView: horizontal or vertical split with configurable ratio
3. Header: top bar with breadcrumb path and right-aligned info
4. Breadcrumb: ◉ ditloop ❯ Pivotree ❯ #042 style navigation
5. StatusBadge: colored indicators (active, warning, error, idle)
6. ShortcutsBar: bottom bar showing available keyboard shortcuts
7. Divider: horizontal line separator
8. ThemeProvider + default theme with color scheme
9. Each component has a .story.tsx in the playground

## Definition of Done
- [ ] All 7 primitives render correctly in terminal
- [ ] Theme system works (colors configurable)
- [ ] Stories exist for each component with variants
- [ ] Component tests with ink-testing-library
- [ ] pnpm test passes

## Status: ⬜ Pending
