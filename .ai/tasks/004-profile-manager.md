# TASK: Profile Manager

## Goal
Implement git identity profile management: CRUD operations, SSH key management, and profile resolution from workspace config.

## Scope

### Allowed
- packages/core/src/profile/profile-manager.ts
- packages/core/src/profile/profile-manager.test.ts
- packages/core/src/profile/ssh-agent.ts
- packages/core/src/profile/ssh-agent.test.ts
- packages/core/src/types/profile.ts

### Forbidden
- packages/core/src/profile/identity-guard.ts (separate task)
- packages/ui/**
- packages/tui/**

## Requirements
1. ProfileManager class that loads profiles from config
2. Methods: list(), get(), getCurrent(), switchTo()
3. switchTo() sets git config user.name + user.email (local to repo)
4. SSHAgent helper: loadKey(), clearAgent()
5. Resolve profile for a workspace/project (with group inheritance)
6. Emit events: identity:switched

## Definition of Done
- [ ] Profiles load from config
- [ ] switchTo() updates git config locally
- [ ] SSH key loading works
- [ ] Profile resolution follows inheritance (project → group)
- [ ] Tests cover all CRUD operations
- [ ] pnpm test passes

## Status: ⬜ Pending
