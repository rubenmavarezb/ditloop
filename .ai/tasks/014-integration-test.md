# TASK: Integration Test — End-to-End Flow

## Goal
Verify the complete v0.1 flow works: load config → resolve workspaces → detect AIDF → show in TUI.

## Scope

### Allowed
- packages/core/src/**/*.test.ts (new integration tests)
- packages/tui/src/**/*.test.tsx (new integration tests)

### Forbidden
- No modifications to source files — test only

## Requirements
1. Create a temp directory with mock workspace structure
2. Config with 1 single workspace + 1 group workspace
3. Group workspace has 2 sub-projects, one with .ai/
4. Verify: config loads, workspaces resolve, AIDF detected, profiles assigned
5. Verify: TUI renders sidebar with correct workspace tree
6. Verify: identity guard detects mismatch correctly
7. Verify: context merger combines group + project AIDF

## Definition of Done
- [ ] Integration test creates realistic temp workspace structure
- [ ] Core flow: config → workspaces → AIDF → profiles all work together
- [ ] TUI renders correctly with the test data
- [ ] pnpm test passes (all unit + integration)
- [ ] No regressions in existing tests

## Status: ✅ Done
