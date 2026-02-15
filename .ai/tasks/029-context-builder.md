# TASK: Context Builder

## Goal
Create ContextBuilder service that assembles rich system prompts from workspace context (AIDF roles, tasks, skills, git status, project structure) and outputs them as injectable files (CLAUDE.md, system-prompt.txt) for AI CLI tools.

## Scope

### Allowed
- packages/core/src/launcher/context-builder.ts
- packages/core/src/launcher/context-builder.test.ts
- packages/core/src/launcher/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. Accept a workspace path and optional AIDF task ID
2. Load AIDF context using existing AidfDetector + ContextLoader from `@ditloop/core`
3. Load git status using existing GitStatusReader
4. Build a structured context document with sections:
   - Project: workspace name, path, type
   - Role: active AIDF role (if any) with full content
   - Task: selected AIDF task (if any) with goal, scope, requirements, DoD
   - Skills: available AIDF skills relevant to the task
   - Git: current branch, status summary, identity info
   - Structure: key directory listing (src/, .ai/, package.json, etc.)
5. Output formats:
   - `toMarkdown()` → string (for CLAUDE.md injection)
   - `toSystemPrompt()` → string (for --system-prompt flag)
   - `toFile(path)` → writes to disk (for temp file injection)
6. Smart truncation: if total context exceeds configurable max (default 8000 chars), truncate lower-priority sections first (structure > skills > git > task > role)
7. Emit `launcher:context-built` event with context stats (sections included, total size)

## Definition of Done
- [ ] ContextBuilder class with all output formats
- [ ] Integrates with AidfDetector, ContextLoader, GitStatusReader
- [ ] Truncation respects priority order
- [ ] Event emitted with stats
- [ ] Unit tests with mock AIDF/git data
- [ ] Test with real workspace path

## Status: 📋 Planned
