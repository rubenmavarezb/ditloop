# TASK: Config Schema & Loader

## Goal
Implement the Zod-validated configuration system that loads ~/.ditloop/config.yml with profiles, workspaces, and defaults.

## Scope

### Allowed
- packages/core/src/config/**
- packages/core/src/types/workspace.ts
- packages/core/src/types/profile.ts

### Forbidden
- packages/ui/**
- packages/tui/**
- packages/playground/**

## Requirements
1. Zod schema for full config (profiles, workspaces single+group, defaults, server)
2. Config loader that reads ~/.ditloop/config.yml
3. Validation with clear error messages on invalid config
4. Default values for optional fields
5. Type exports for DitLoopConfig and sub-types
6. Unit tests for schema validation (valid + invalid configs)

## Definition of Done
- [ ] ConfigSchema validates all workspace types (single, group)
- [ ] Config loader reads YAML and validates with Zod
- [ ] Defaults are applied for optional fields
- [ ] Type-safe config object exported
- [ ] Tests cover: valid config, missing fields, invalid values, defaults
- [ ] pnpm test passes

## Status: ⬜ Pending
