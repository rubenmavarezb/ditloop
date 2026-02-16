# TASK: Keyboard shortcuts system

## Goal
Comprehensive keyboard shortcut system with global registry, customizable keybindings, and discoverable hints.

## Scope

### Allowed
- packages/desktop/src/hooks/useShortcuts.ts
- packages/desktop/src/components/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Global shortcut registry (map of key combo → action)
2. Default shortcuts:
   - Cmd/Ctrl+K: Command palette
   - Cmd/Ctrl+1-5: Switch layout modes
   - Cmd/Ctrl+`: Toggle terminal
   - Cmd/Ctrl+Shift+G: Focus Source Control
   - Cmd/Ctrl+Shift+E: Focus Explorer
   - Cmd/Ctrl+B: Toggle left sidebar
   - Cmd/Ctrl+J: Toggle bottom panel
   - Cmd/Ctrl+Tab: Next workspace tab
   - Cmd/Ctrl+Shift+Tab: Previous workspace tab
   - Cmd/Ctrl+W: Close current tab
   - Cmd/Ctrl+N: New terminal
   - Cmd/Ctrl+Enter: Send AI message / Commit
3. Context-aware: different shortcuts active depending on focused panel
4. Customizable: settings page for rebinding keys
5. Shortcut hints in tooltips and menus
6. "Keyboard Shortcuts" reference sheet (Cmd+Shift+?)
7. No conflicts with system/Tauri shortcuts

## Definition of Done
- [ ] ShortcutRegistry with register/unregister/trigger
- [ ] Default keymap configuration
- [ ] Keybindings settings UI
- [ ] Reference sheet component
- [ ] Tests for shortcut registration and conflict detection
- [ ] All listed shortcuts work
- [ ] Custom keybindings persist

## Metadata
- **Version**: v0.8
- **Phase**: Phase 5: Polish
- **Priority**: medium
- **Package**: @ditloop/desktop

## Status: 📋 Planned
