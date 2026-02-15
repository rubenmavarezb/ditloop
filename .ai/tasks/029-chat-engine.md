# TASK: Chat Engine

## Goal
Implement ChatEngine class that manages conversation state, message history, and integrates with ProviderAdapter for streaming responses while injecting workspace/AIDF context.

## Scope

### Allowed
- packages/core/src/chat/chat-engine.ts
- packages/core/src/chat/chat-engine.test.ts
- packages/core/src/chat/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. Manage conversation state and message history
2. Integrate with ProviderAdapter for streaming responses
3. Inject workspace and AIDF context into prompts
4. Emit events: chat:message-sent, chat:response-streaming, chat:response-complete
5. Handle tool calls for file reads and searches
6. Support conversation persistence via SessionStore

## Definition of Done
- [ ] ChatEngine class implemented with full streaming support
- [ ] Events properly emitted at each stage
- [ ] Tool call handling for file operations integrated
- [ ] Unit tests with 80%+ coverage
- [ ] Integration test with mock ProviderAdapter

## Status: 📋 Planned
