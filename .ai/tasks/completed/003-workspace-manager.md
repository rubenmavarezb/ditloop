# TASK: Workspace Manager

## Goal
Implement workspace management: single projects, groups with sub-projects, and auto-discovery of git repos in group directories.

## Scope

### Allowed
- packages/core/src/workspace/**
- packages/core/src/types/workspace.ts

### Forbidden
- packages/ui/**
- packages/tui/**
- packages/playground/**

## Requirements
1. WorkspaceManager class that loads workspaces from config
2. Support for single-type workspaces (one path, one project)
3. Support for group-type workspaces (parent path with sub-projects)
4. GroupResolver that maps group path to individual projects
5. AutoDiscover that scans directories for .git folders
6. Project override resolution (project settings override group settings)
7. Methods: list(), get(), getProjects(), getActiveWorkspace()
8. Emit events: workspace:entered, workspace:discovered

## Definition of Done
- [x] Single workspaces load correctly
- [x] Group workspaces discover sub-projects
- [x] Auto-discover finds .git directories
- [x] Project overrides work (profile, provider)
- [x] Events emitted on workspace enter
- [x] Tests with temp directory structures
- [x] pnpm test passes

## Status: ✅ Done
