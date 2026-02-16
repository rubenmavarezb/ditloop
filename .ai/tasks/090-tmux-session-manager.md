# TASK: tmux session manager

## Goal
Node.js module that creates, manages, and controls tmux sessions/panes programmatically.

## Scope

### Allowed
- packages/tui/src/tmux/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Detect if tmux is installed and available
2. Create a named tmux session (`ditloop-{workspace}`)
3. Create pane layout: left (25%) | center (50%) | right (25%)
4. Send commands to specific panes (`tmux send-keys`)
5. Resize panes programmatically
6. Kill panes/session on exit
7. Detect if already inside a tmux session (attach vs create)
8. Handle tmux version differences (3.0+ target)

## API sketch
```typescript
class TmuxManager {
  async createSession(name: string): Promise<void>
  async createPane(position: 'left'|'right'|'bottom', size: number): Promise<string>
  async sendKeys(paneId: string, keys: string): Promise<void>
  async resizePane(paneId: string, size: number): Promise<void>
  async selectPane(paneId: string): Promise<void>
  async killSession(): Promise<void>
  isInsideTmux(): boolean
  isTmuxAvailable(): boolean
}
```

## Definition of Done
- [ ] TmuxManager class with all methods
- [ ] Session lifecycle: create, attach, kill
- [ ] Pane management: create, resize, send-keys, select
- [ ] Error handling for missing tmux
- [ ] Unit tests with tmux mocking

## Metadata
- **Version**: v0.8-TUI
- **Phase**: Phase 1: tmux Foundation
- **Priority**: critical
- **Package**: @ditloop/tui
- **Plan task ID**: T01

## Status: planned
