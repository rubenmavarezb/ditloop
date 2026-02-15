# TASK: OpenAI Adapter

## Goal
Implement OpenAIAdapter using openai SDK to validate the adapter abstraction.

## Scope

### Allowed
- packages/core/src/provider/adapters/openai-adapter.ts
- packages/core/src/provider/adapters/openai-adapter.test.ts
- packages/core/src/provider/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. OpenAIAdapter implements ProviderAdapter
2. sendMessage() maps to chat.completions.create({ stream: true })
3. Handles function_call/tool_calls
4. AIDF context injection as system message
5. API key from config or OPENAI_API_KEY env

## Definition of Done
- [ ] Streams responses from OpenAI API
- [ ] Function calls detected and yielded
- [ ] AIDF context injected as system message
- [ ] API key loaded from config or env
- [ ] Tests with mocks pass

## Status: ⏳ Pending
