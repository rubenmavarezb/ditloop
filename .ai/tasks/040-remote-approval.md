# TASK: Remote Approval

## Goal
Create remote approval endpoint that broadcasts approval requests via WebSocket and accepts the first response with timeout handling.

## Scope

### Allowed
- packages/server/src/api/approvals.ts
- packages/server/src/api/approvals.test.ts

### Forbidden
- packages/core/** (import Safety types only)

## Requirements
1. POST /api/approvals/:id endpoint for submitting approval responses
2. Broadcast safety:review-requested to WebSocket clients
3. First response wins (approve/reject)
4. Timeout after 5 minutes with auto-rejection
5. Return approval status with reviewer info
6. Handle concurrent approval attempts

## Definition of Done
- [ ] Approval endpoint functional
- [ ] WebSocket broadcast working
- [ ] First-response-wins logic correct
- [ ] Timeout auto-rejects after 5min
- [ ] Integration tests with WebSocket clients

## Status: 📋 Planned
