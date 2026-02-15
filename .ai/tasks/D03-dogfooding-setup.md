# TASK: Dogfooding Setup

## Goal
Make DitLoop CLI installable and usable locally via `pnpm link`, create a real config file, and verify all CLI commands work end-to-end.

## Scope

### Allowed
- packages/tui/package.json (fix bin/files if needed)
- packages/tui/tsup.config.ts (ensure shebang banner)
- ~/.ditloop/config.yaml (user config, not in repo)

### Forbidden
- Changes to business logic
- Changes to other packages beyond what's needed for linking

## Requirements
1. Verify `pnpm build` produces working dist/index.js with shebang
2. `pnpm link --global --filter @ditloop/tui` makes `ditloop` command available
3. Create real `~/.ditloop/config.yaml` with Ruben's actual workspaces and profiles
4. Test every CLI command:
   - `ditloop` → launches TUI dashboard
   - `ditloop --version` → prints version
   - `ditloop --help` → shows help
   - `ditloop workspace list` → lists configured workspaces
   - `ditloop profile list` → lists profiles
   - `ditloop profile current` → shows current git identity
   - `ditloop scaffold task` → launches scaffold wizard
5. Document any issues found and fix them
6. Add a `dev` script to root package.json for quick rebuild + relink

## Definition of Done
- [ ] `ditloop` command works globally after `pnpm link`
- [ ] All CLI commands produce correct output
- [ ] TUI dashboard renders with real workspace data
- [ ] No crashes or unhandled errors
- [ ] Quick iteration workflow documented (build → test)

## Status: 📋 Planned
