# TASK: Execution API

## Goal
Create REST and SSE API for executing tasks, launching AI CLIs remotely, streaming output, listing executions, and canceling running tasks.

## Scope

### Allowed
- packages/server/src/api/executions.ts
- packages/server/src/api/executions.test.ts

### Forbidden
- packages/core/** (import ExecutionEngine and AiLauncher only)

## Requirements
1. POST /api/execute — start new execution via ExecutionEngine with AIDF task context
2. POST /api/launch — launch AI CLI in non-interactive mode via AiLauncher, capture output
3. GET /api/executions — list all executions (filter by workspace, status, date range)
4. GET /api/executions/:id — get execution detail (status, output, actions)
5. GET /api/executions/:id/stream — SSE stream of real-time output (stdout/stderr chunks)
6. POST /api/executions/:id/cancel — cancel running execution (send SIGTERM to child process)
7. Return execution metadata: id, workspace, status, startTime, duration, exitCode, actionCount

## Definition of Done
- [ ] All endpoints functional
- [ ] SSE streaming works with real-time output
- [ ] Cancel terminates running execution
- [ ] Filtering and pagination on list endpoint
- [ ] Integration tests for all endpoints

## Status: 📋 Planned
