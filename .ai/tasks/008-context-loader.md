# TASK: AIDF Context Loader & Merger

## Goal
Load .ai/ context (AGENTS.md, tasks, roles, skills) and merge group-level with project-level context.

## Scope

### Allowed
- packages/core/src/aidf/context-loader.ts
- packages/core/src/aidf/context-loader.test.ts
- packages/core/src/aidf/context-merger.ts
- packages/core/src/aidf/context-merger.test.ts
- packages/core/src/aidf/task-parser.ts
- packages/core/src/aidf/task-parser.test.ts
- packages/core/src/aidf/role-loader.ts
- packages/core/src/aidf/skill-loader.ts
- packages/core/src/aidf/plan-parser.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ContextLoader reads all .ai/ files for a given directory
2. TaskParser parses task .md files (frontmatter + sections: goal, scope, requirements, DoD, status)
3. RoleLoader reads .ai/roles/*.md
4. SkillLoader reads .ai/skills/*/SKILL.md
5. PlanParser reads .ai/plans/*.md
6. ContextMerger combines group context + project context (project wins on conflicts)
7. Uses gray-matter for markdown + YAML frontmatter parsing

## Definition of Done
- [ ] Context loads from .ai/ directories
- [ ] Tasks parsed with scope, DoD, status, requirements
- [ ] Roles and skills loaded
- [ ] Merger correctly resolves conflicts (project wins)
- [ ] Tests with sample .ai/ structures
- [ ] pnpm test passes

## Status: ⬜ Pending
