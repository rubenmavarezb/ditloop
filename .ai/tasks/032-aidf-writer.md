# TASK: AIDF Writer

## Goal
Create AidfWriter service for creating, updating, and deleting AIDF files (tasks, roles, skills, plans) with validation and event emission.

## Scope

### Allowed
- packages/core/src/aidf/writer/aidf-writer.ts
- packages/core/src/aidf/writer/aidf-writer.test.ts
- packages/core/src/aidf/writer/index.ts
- packages/core/src/aidf/index.ts (add export)

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. Create/update/delete AIDF files in workspace .ai/ directory
2. Validate against AIDF format using Zod schemas
3. Emit events: aidf:created, aidf:updated, aidf:deleted
4. Support all AIDF types: task, role, skill, plan
5. Preserve file metadata and formatting (frontmatter + markdown body)
6. Atomic file writes with backups

## Definition of Done
- [ ] All CRUD operations for each AIDF type
- [ ] Zod validation for all formats
- [ ] Events emitted with full context
- [ ] Atomic writes with backup/rollback
- [ ] Unit tests for all operations and validation

## Status: 📋 Planned
