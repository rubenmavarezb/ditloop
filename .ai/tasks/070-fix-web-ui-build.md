# TASK: Fix web-ui TypeScript build

## Goal
Fix the broken TypeScript build in @ditloop/web-ui that blocks desktop, mobile, and CI.

## Scope

### Allowed
- packages/web-ui/

### Forbidden
- packages/core/**
- packages/tui/**

## Requirements
1. Fix missing `@types/react` type declarations
2. Fix `key` prop error in `WorkspaceList.tsx` (key is React-reserved, remove from props interface)
3. Fix untyped parameter `e` in event handlers
4. Fix missing React namespace for JSX
5. Ensure `pnpm build` passes for web-ui
6. Verify downstream packages (desktop, mobile) can build

## Definition of Done
- [ ] `pnpm turbo build` passes for all packages (10/10)
- [ ] No TypeScript errors in web-ui
- [ ] CI pipeline green
- [ ] No regressions in existing tests (654+)

## Metadata
- **Version**: v0.8
- **Phase**: Phase 1: Foundation
- **Priority**: critical
- **Package**: @ditloop/web-ui

## Status: 📋 Planned
