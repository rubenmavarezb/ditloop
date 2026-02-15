# TASK: AIDF Detector

## Goal
Implement detection of AIDF (.ai/ folder) in projects, determining what features are available based on what's present.

## Scope

### Allowed
- packages/core/src/aidf/aidf-detector.ts
- packages/core/src/aidf/aidf-detector.test.ts
- packages/core/src/aidf/types.ts

### Forbidden
- packages/core/src/aidf/context-loader.ts (separate task)
- packages/ui/**
- packages/tui/**

## Requirements
1. AidfDetector class that checks if a directory has .ai/
2. Detect presence of: AGENTS.md, config.yml, roles/, skills/, tasks/, plans/, templates/
3. Return an AidfCapabilities object describing what's available
4. Works for both group-level and project-level .ai/
5. Fast — uses fs.existsSync, no deep scanning

## Definition of Done
- [ ] Detects .ai/ folder presence
- [ ] Returns correct capabilities for full, partial, and missing AIDF
- [ ] Tests with temp directories
- [ ] pnpm test passes

## Status: ⬜ Pending
