# TASK: Playground Setup

## Goal
Build the component catalog TUI that lets developers browse and preview all @ditloop/ui components with their variants.

## Scope

### Allowed
- packages/playground/src/**

### Forbidden
- packages/core/**
- packages/ui/src/** (use existing components)
- packages/tui/**

## Requirements
1. Entry point: ditloop-playground or ditloop playground
2. Catalog view: sidebar with component categories, main area with preview
3. Story format: each .story.tsx exports meta + named story variants
4. Navigate components with ↑↓, see preview on the right
5. Toggle between variants with v key
6. Interactive mode with i key (for input components)
7. Show component props documentation

## Definition of Done
- [ ] Playground launches and shows component list
- [ ] Navigation between components works
- [ ] Stories render correctly
- [ ] At least one story per UI component built in v0.1
- [ ] pnpm playground works

## Status: ✅ Done
