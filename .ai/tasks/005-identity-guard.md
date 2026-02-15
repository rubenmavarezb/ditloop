# TASK: Identity Guard

## Goal
Implement the pre-commit/pre-push identity verification that ensures the correct git profile is active before any git operation.

## Scope

### Allowed
- packages/core/src/profile/identity-guard.ts
- packages/core/src/profile/identity-guard.test.ts

### Forbidden
- packages/core/src/profile/profile-manager.ts (already built)
- packages/ui/**
- packages/tui/**

## Requirements
1. IdentityGuard class that verifies git identity matches workspace profile
2. Methods: verify(), autoFix(), getExpectedProfile()
3. Verification at: workspace enter, pre-commit, pre-push
4. On mismatch: emit identity:mismatch event with current vs expected
5. AutoFix: call ProfileManager.switchTo() automatically
6. Integration with EventBus for mismatch notifications

## Definition of Done
- [ ] Detects identity mismatch correctly
- [ ] autoFix switches to the correct profile
- [ ] Events emitted on mismatch and fix
- [ ] Tests cover: match, mismatch, auto-fix, missing profile
- [ ] pnpm test passes

## Status: ⬜ Pending
