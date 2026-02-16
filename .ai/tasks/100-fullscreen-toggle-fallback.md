# TASK: Fullscreen toggle fallback (no-tmux mode)

## Goal
For users without tmux, DitLoop offers fullscreen toggle mode (like LazyGit).

## Scope

### Allowed
- packages/tui/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Detect tmux not available on startup
2. Show DitLoop panels normally (existing Ink behavior)
3. [Enter] on workspace: unmount Ink, spawn shell with `stdio: 'inherit'`
4. Shell gets workspace path, git identity, env vars
5. On shell exit (Ctrl+D or `exit`): re-render Ink panels
6. Message: "tmux not found -- running in toggle mode. Install tmux for side-by-side."

## Definition of Done
- [ ] Detects missing tmux
- [ ] Toggle mode works: Ink -> shell -> Ink
- [ ] Shell inherits workspace context
- [ ] Graceful messaging
- [ ] Tests for toggle mode flow

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 4: Polish
- **Priority**: low
- **Package**: @ditloop/tui
- **Plan task ID**: T11
- **Depends on**: none (independent)

## Status: planned
