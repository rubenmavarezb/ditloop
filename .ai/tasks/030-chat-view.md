# TASK: Chat View

## Goal
Build ChatView component in TUI with message list, scrolling, input area, streaming response rendering, and code block highlighting.

## Scope

### Allowed
- packages/tui/src/views/Chat/ChatView.tsx
- packages/tui/src/views/Chat/ChatView.test.tsx
- packages/tui/src/views/Chat/index.ts

### Forbidden
- packages/core/**
- packages/ui/**

## Requirements
1. Scrollable message list with auto-scroll on new messages
2. Input area with multi-line support
3. Streaming response rendering with visual indicators
4. Syntax-highlighted code blocks
5. Keyboard shortcuts: Enter=send, Esc=back, Ctrl+C=cancel
6. Action indicators (typing, thinking, executing)

## Definition of Done
- [ ] ChatView renders messages with proper formatting
- [ ] Streaming responses display in real-time
- [ ] Code blocks have syntax highlighting
- [ ] All keyboard shortcuts functional
- [ ] Component tests with interaction scenarios

## Status: 📋 Planned
