# TASK: Side-by-side diff viewer

## Goal
Diff viewer component showing file changes in side-by-side or inline mode with syntax highlighting.

## Scope

### Allowed
- packages/web-ui/src/components/DiffViewer/
- packages/desktop/src/views/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Side-by-side view: ORIGINAL (left) vs MODIFIED (right)
2. Inline view toggle (unified diff)
3. Syntax highlighting (use highlight.js or Prism)
4. Line numbers on both sides
5. Color coding: green bg for additions, red bg for deletions
6. +N / -N indicators in header
7. Navigation between hunks (next/prev change)
8. File selector when multiple files changed
9. Hunk-level staging (stage individual changes, not whole file)
10. Scrolling synced between left and right panels

## Definition of Done
- [ ] DiffViewer component (shared in web-ui)
- [ ] Diff parsing from git diff output
- [ ] Syntax highlighting integration
- [ ] Hunk navigation
- [ ] Tests for diff parsing
- [ ] Side-by-side and inline modes both work

## Metadata
- **Version**: v0.8
- **Phase**: Phase 2: Core Panels
- **Priority**: medium
- **Package**: @ditloop/desktop, @ditloop/web-ui

## Status: 📋 Planned
