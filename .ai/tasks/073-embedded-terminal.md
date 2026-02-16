# TASK: Embedded terminal with xterm.js and Tauri PTY

## Goal
Integrate a real terminal emulator using xterm.js on the frontend and a PTY (pseudo-terminal) backend in Rust. Each workspace gets its own terminal that auto-cd's to the workspace path and inherits the workspace's git identity.

## Scope

### Allowed
- packages/desktop/src/components/Terminal/
- packages/desktop/src-tauri/src/commands/pty.rs

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Frontend: xterm.js with xterm-addon-fit, xterm-addon-webgl for performance
2. Rust backend: use `portable-pty` crate to spawn shell processes
3. Tauri IPC: bidirectional data channel (stdin/stdout) via events
4. Auto-cd to workspace path on terminal creation
5. Set git identity env vars for the terminal session
6. Multiple terminals per workspace (tab bar within terminal panel)
7. Horizontal split support (two terminals side-by-side)
8. Terminal resize handling (xterm.js fit addon + PTY resize)
9. Terminal theme inherits app theme colors
10. Cleanup: kill PTY process when terminal/tab is closed

## Definition of Done
- [ ] TerminalPanel React component
- [ ] Rust PTY manager with spawn/read/write/resize/kill commands
- [ ] Terminal tab management
- [ ] Can type commands and see real output
- [ ] Terminal auto-opens in workspace directory
- [ ] Multiple terminal tabs work
- [ ] Split terminal works
- [ ] Terminal survives workspace tab switching

## Metadata
- **Version**: v0.8
- **Phase**: Phase 2: Core Panels
- **Priority**: critical
- **Package**: @ditloop/desktop, src-tauri

## Status: 📋 Planned
