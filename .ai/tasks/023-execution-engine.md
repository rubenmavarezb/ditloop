# TASK: Execution Engine

## Goal
Build the execution engine that orchestrates AI-assisted task execution with streaming and action proposals.

## Scope

### Allowed
- packages/core/src/executor/execution-engine.ts
- packages/core/src/executor/execution-engine.test.ts
- packages/core/src/executor/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ExecutionEngine class: execute(task, workspace, provider) → ExecutionSession
2. Builds prompt from AIDF (role + skill + task + workspace context)
3. Calls provider.sendMessage() with streaming
4. Emits executor:started, executor:streaming, executor:action-proposed, executor:completed
5. Delegates tool calls to ActionParser

## Definition of Done
- [ ] Executes task end-to-end with mock provider
- [ ] Events emitted at each stage
- [ ] Prompt includes AIDF context
- [ ] Streaming responses processed
- [ ] Tool calls delegated to ActionParser
- [ ] Tests pass

## Status: ⏳ Pending
