# TASK: Execution API

## Goal
Create REST and SSE API for executing commands, streaming output, listing executions, and canceling running tasks.

## Scope

### Allowed
- packages/server/src/api/executions.ts
- packages/server/src/api/executions.test.ts

### Forbidden
- packages/core/** (import Executor only)

## Requirements
1. POST /api/execute - start new execution
2. GET /api/executions - list all executions
3. GET /api/executions/:id/stream - SSE stream of output
4. POST /api/executions/:id/cancel - cancel running execution
5. Support filtering by workspace and status
6. Return execution metadata (start time, duration, exit code)

## Definition of Done
- [ ] All endpoints functional
- [ ] SSE streaming working
- [ ] Cancel operation successful
- [ ] Filtering and pagination working
- [ ] Integration tests for all endpoints

## Status: 📋 Planned
