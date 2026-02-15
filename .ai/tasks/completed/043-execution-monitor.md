# TASK: Execution Monitor

## Goal
Implement ExecutionMonitor to track running executions, enforce rate limits per provider, manage FIFO queue, and collect metrics.

## Scope

### Allowed
- packages/server/src/execution/execution-monitor.ts
- packages/server/src/execution/execution-monitor.test.ts
- packages/server/src/execution/index.ts

### Forbidden
- packages/core/** (import types only)

## Requirements
1. Track all active and completed executions with metadata
2. Rate limiting per provider (configurable, e.g. Claude: 3 concurrent, OpenAI: 5 concurrent)
3. FIFO queue for pending executions when rate limit reached
4. Metrics collection: total runs, success/failure counts, average duration, provider usage
5. GET /api/executions/stats endpoint for metrics
6. Auto-cleanup of completed execution records (configurable retention, default 24h)
7. Emit `execution:queued` event when task enters queue
8. Emit `execution:dequeued` event when task starts from queue

## Definition of Done
- [ ] Execution tracking with full lifecycle
- [ ] Rate limiting enforced per provider
- [ ] FIFO queue processes in order
- [ ] Metrics collected and exposed via endpoint
- [ ] Auto-cleanup removes stale records
- [ ] Unit tests for rate limiting, queueing, and metrics

## Status: 📋 Planned
