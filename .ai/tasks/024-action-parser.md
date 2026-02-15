# TASK: Action Parser

## Goal
Extract structured actions (file edits, shell commands, git ops) from AI responses.

## Scope

### Allowed
- packages/core/src/executor/action-parser.ts
- packages/core/src/executor/action-parser.test.ts
- packages/core/src/executor/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ActionParser class: parse(chunk, context) → Action[]
2. Action types: FileCreateAction, FileEditAction, ShellCommandAction, GitOperationAction
3. Supports tool use format and markdown code blocks
4. Generates unified diff preview for file edits
5. Validates action schemas with Zod

## Definition of Done
- [ ] Parses tool calls correctly
- [ ] Parses markdown actions correctly
- [ ] Generates unified diffs for file edits
- [ ] Validates schemas with Zod
- [ ] All action types supported
- [ ] Tests pass

## Status: ⏳ Pending
