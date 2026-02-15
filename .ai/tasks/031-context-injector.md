# TASK: Context Injector

## Goal
Create ContextInjector that builds optimized system prompts from workspace context including AIDF role, skills, current task, git status, and project structure.

## Scope

### Allowed
- packages/core/src/chat/context-injector.ts
- packages/core/src/chat/context-injector.test.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. Build system prompt from workspace context (AIDF role, skills, current task)
2. Include git status and relevant project structure
3. Smart truncation to fit token limits (configurable max tokens)
4. Cache context and invalidate on workspace/task changes
5. Prioritize most relevant context when truncating
6. Support multiple context templates per role type

## Definition of Done
- [ ] ContextInjector builds complete system prompts
- [ ] Truncation algorithm respects token limits
- [ ] Caching with proper invalidation implemented
- [ ] Unit tests for all context scenarios
- [ ] Performance test with large workspaces

## Status: 📋 Planned
