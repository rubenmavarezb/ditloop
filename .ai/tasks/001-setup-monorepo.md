# TASK: Setup Monorepo

## Goal
Initialize the ditloop monorepo with pnpm workspaces, Turborepo, TypeScript, and all 4 packages with proper dependency wiring.

## Scope

### Allowed
- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.base.json
- packages/*/package.json
- packages/*/tsconfig.json
- packages/*/tsup.config.ts
- packages/*/src/index.ts
- .gitignore

### Forbidden
- packages/*/src/** (beyond index.ts)
- .ai/**

## Requirements
1. Root package.json with workspace scripts
2. pnpm-workspace.yaml pointing to packages/* and apps/*
3. Turborepo config with build, test, typecheck, lint tasks
4. Base tsconfig.json with strict mode, ESM, bundler resolution
5. Each package has: package.json, tsconfig.json, tsup.config.ts, src/index.ts
6. @ditloop/tui and @ditloop/playground have bin entries
7. Cross-package dependencies use workspace:* protocol
8. pnpm install runs without errors

## Definition of Done
- [x] Monorepo structure created
- [x] All package.json files with correct dependencies
- [x] pnpm install succeeds
- [ ] pnpm build succeeds across all packages
- [ ] pnpm typecheck passes

## Status: 🟡 In Progress
