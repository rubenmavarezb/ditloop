# TASK: File explorer panel with git status

## Goal
Tree view file explorer that shows the workspace directory structure with git status indicators and AIDF folder awareness.

## Scope

### Allowed
- packages/desktop/src/components/FileBrowser/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Recursive directory tree with expand/collapse
2. Lazy loading for large directories
3. Git status indicators: M (yellow), A (green), D (red), ? (gray) per file
4. .ai/ folder gets sparkle icon and special treatment
5. .gitignore-aware (hide ignored files, toggle to show)
6. Click file to open in viewer tab (center panel)
7. Right-click context menu: Open in Terminal, Open in $EDITOR, View Git History, Copy Path
8. File watcher (Tauri fs events) for real-time updates
9. Search/filter within explorer
10. Icons for common file types (ts, tsx, json, md, rs, etc.)

## Definition of Done
- [ ] FileExplorer component with tree rendering
- [ ] Rust file system commands (read_dir, watch)
- [ ] Git status integration
- [ ] File type icons
- [ ] Tests for tree state management
- [ ] .ai/ folder visually distinct
- [ ] Real-time updates when files change

## Metadata
- **Version**: v0.8
- **Phase**: Phase 2: Core Panels
- **Priority**: high
- **Package**: @ditloop/desktop

## Status: 📋 Planned
