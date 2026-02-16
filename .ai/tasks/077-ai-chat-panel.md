# TASK: AI Chat panel with multi-provider support

## Goal
Chat interface for conversing with AI providers about the current workspace code. Supports multiple providers, shows AIDF context, and bridges conversation to task execution.

## Scope

### Allowed
- packages/web-ui/src/components/ChatPanel/
- packages/desktop/src/hooks/

### Forbidden
- packages/core/** (use existing adapters, don't modify)
- packages/tui/**

## Requirements
1. Chat message list with user/AI bubbles
2. Provider selector dropdown (reads from @ditloop/core config)
3. AIDF context badge: shows loaded roles, tasks, plans
4. Code blocks in AI responses with syntax highlighting + Copy button
5. Action buttons on AI responses: "Apply Changes", "Create Task", "Reject"
6. "Send as Task" toggle — switches from chat mode to autonomous task execution
7. Message input with: text area, file attachment, send button
8. Conversation history per workspace (persisted locally)
9. Streaming responses (show tokens as they arrive)
10. Provider-specific features: model selector, temperature, max tokens
11. Slash commands in input: /task, /context, /switch-provider
12. "Add Context" to attach files to the conversation

## Definition of Done
- [ ] ChatPanel component
- [ ] Chat store (Zustand) with per-workspace history
- [ ] Provider integration via @ditloop/core adapters
- [ ] Streaming response rendering
- [ ] Tests for chat state and message parsing
- [ ] Can chat with Claude and at least one other provider
- [ ] AIDF context loads automatically for workspace
- [ ] Code blocks render with syntax highlighting
- [ ] Conversation persists across tab switches

## Metadata
- **Version**: v0.8
- **Phase**: Phase 3: AI Integration
- **Priority**: critical
- **Package**: @ditloop/desktop, @ditloop/web-ui

## Status: 📋 Planned
