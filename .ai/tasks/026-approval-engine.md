# TASK: Approval Engine

## Goal
Core approval workflow that queues AI-proposed actions for human review.

## Scope

### Allowed
- packages/core/src/safety/approval-engine.ts
- packages/core/src/safety/approval-engine.test.ts
- packages/core/src/safety/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ApprovalEngine class: requestApproval(actions) → Promise<ApprovalResult>
2. Methods: approveOne(), approveAll(), reject(), edit()
3. Queue with states: pending/approved/rejected/edited
4. Emits safety:review-requested, safety:approved, safety:rejected

## Definition of Done
- [ ] Queues actions correctly
- [ ] Approval/rejection works
- [ ] Edit mode works
- [ ] Events emitted on state changes
- [ ] Promise resolves with correct results
- [ ] Tests pass

## Status: ⏳ Pending
