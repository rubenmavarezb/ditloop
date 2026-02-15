# TASK: Diff Review View

## Goal
TUI component for reviewing proposed changes with diffs, risk badges, and approve/reject controls.

## Scope

### Allowed
- packages/tui/src/views/DiffReview/DiffReviewView.tsx
- packages/tui/src/views/DiffReview/DiffReviewView.test.tsx
- packages/tui/src/views/DiffReview/index.ts

### Forbidden
- packages/core/** (use existing)
- packages/ui/** (use existing)

## Requirements
1. Unified diff rendering with green (+) / red (-) lines
2. Shell command risk badges: safe/caution/danger
3. Keyboard: y=approve, n=reject, e=edit, a=approve-all
4. Scrollable action list with focus management
5. Integrates with ApprovalEngine

## Definition of Done
- [ ] Diffs render correctly with colors
- [ ] Risk badges shown for shell commands
- [ ] Keyboard shortcuts work
- [ ] Scrollable action list works
- [ ] Focus management works
- [ ] Tests pass

## Status: ⏳ Pending
