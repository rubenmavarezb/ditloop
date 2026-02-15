# TASK: Remote Approval

## Goal
Create remote approval endpoints that broadcast approval requests via WebSocket and accept responses with first-response-wins semantics.

## Scope

### Allowed
- packages/server/src/api/approvals.ts
- packages/server/src/api/approvals.test.ts

### Forbidden
- packages/core/** (import ApprovalEngine types only)

## Requirements
1. GET /api/approvals — list pending approval requests
2. POST /api/approvals/:id — submit approval response (approve/reject/edit)
3. Bridge `approval:requested` events to WebSocket clients automatically
4. First-response-wins: once an approval is answered, reject duplicate responses with 409
5. Timeout after 5 minutes with auto-rejection
6. Response body includes action details (type, path, diff preview) for informed decisions
7. Support `edit` response that modifies the action before approval

## Definition of Done
- [ ] Approval listing endpoint functional
- [ ] Submit endpoint with approve/reject/edit working
- [ ] WebSocket broadcast of approval:requested events
- [ ] First-response-wins logic prevents race conditions
- [ ] Timeout auto-rejects after 5min
- [ ] Integration tests with mock ApprovalEngine

## Status: 📋 Planned
