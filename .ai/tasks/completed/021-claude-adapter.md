# TASK: Claude Adapter

## Goal
Implement ClaudeAdapter using @anthropic-ai/sdk with streaming and tool use support.

## Scope

### Allowed
- packages/core/src/provider/adapters/claude-adapter.ts
- packages/core/src/provider/adapters/claude-adapter.test.ts
- packages/core/src/provider/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ClaudeAdapter implements ProviderAdapter
2. sendMessage() maps to client.messages.stream(), yields StreamChunks
3. Handles tool_use blocks in response
4. AIDF context injection as system prompt
5. API key from config or ANTHROPIC_API_KEY env
6. Error handling for rate limits, invalid key

## Definition of Done
- [ ] Streams responses from Claude API
- [ ] Tool use blocks detected and yielded
- [ ] AIDF context injected as system prompt
- [ ] API key loaded from config or env
- [ ] Error handling for rate limits
- [ ] Tests with mocks pass

## Status: ✅ Done
