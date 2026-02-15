# TASK: Execution Monitor

## Goal
Implement ExecutionMonitor to track running executions, enforce rate limits per provider, manage FIFO queue, and collect metrics.

## Scope

### Allowed
- packages/server/src/execution/execution-monitor.ts
- packages/server/src/execution/execution-monitor.test.ts

### Forbidden
- packages/core/** (import types only)

## Requirements
1. Track all running executions with metadata
2. Rate limiting per provider (configurable limits)
3. FIFO queue for pending executions
4. Metrics: total runs, success/failure counts, avg duration
5. GET /api/executions/stats endpoint
6. Auto-cleanup of completed executions (configurable retention)

## Definition of Done
- [ ] Execution tracking functional
- [ ] Rate limiting enforced per provider
- [ ] Queue processes executions in order
- [ ] Metrics collected and exposed
- [ ] Unit tests for rate limiting and queueing

## Status: 📋 Planned
