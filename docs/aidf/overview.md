# AIDF Overview

**AIDF** (AI Development Framework) is a structured approach to providing context for AI-assisted development. It defines a standard directory layout and file formats that AI tools can consume to understand your project.

## What is AIDF?

When you work with AI coding assistants (Claude, ChatGPT, Cursor, etc.), they need context about your project — architecture, conventions, current tasks, and what role they should play. AIDF standardizes this by defining an `.ai/` directory structure that any AI tool can read.

DitLoop has built-in support for detecting, loading, and scaffolding AIDF files.

## Directory Structure

```
.ai/
├── AGENTS.md              # Master project context
├── config.yml             # AIDF configuration
├── roles/                 # Role definitions
│   ├── architect.md
│   ├── developer.md
│   ├── tester.md
│   ├── reviewer.md
│   └── documenter.md
├── skills/                # Role-specific skills
│   ├── aidf-developer/
│   ├── aidf-tester/
│   └── ...
├── tasks/                 # Development tasks
│   ├── T01-task-name.md
│   └── ...
├── plans/                 # Multi-task initiatives
│   ├── PLAN-v01-name.md
│   └── ...
└── templates/             # Scaffolding templates
```

## File Types

### AGENTS.md

The master context file. Contains:
- Project overview and architecture
- File organization rules
- Code conventions
- Mandatory guidelines

This is the first file AI tools should read to understand the project.

### Roles

Define personas for AI assistants. Each role has:
- **Identity**: What the role is (architect, developer, tester, etc.)
- **Expertise**: Domain knowledge
- **Behavior rules**: What to always/never do
- **Response format**: Expected output structure

```markdown
# Role: Developer

## Identity
Senior developer focused on clean, tested, maintainable code.

## Expertise
- TypeScript strict mode
- React + Ink terminal UI
- Event-driven architecture

## Behavior
### ALWAYS
- Read existing code before modifying
- Write co-located tests
- Follow established patterns

### NEVER
- Change architecture without approval
- Skip tests
- Modify outside scope
```

### Skills

Specialized capabilities attached to roles. Each skill defines:
- **Name and description**
- **Tags** for categorization
- **Globs** for relevant files
- **Expertise areas**
- **Behavior rules**

### Tasks

Structured development tasks with:
- **Goal**: What needs to be done
- **Scope**: Allowed and forbidden files/changes
- **Requirements**: Detailed specifications
- **Definition of Done**: Acceptance criteria

```markdown
# TASK: Add Workspace Search

## Goal
Add fuzzy search to the workspace sidebar.

## Scope
### Allowed
- packages/ui/src/input/SearchInput/
- packages/tui/src/views/Home/

### Forbidden
- packages/core/ (no business logic changes)

## Requirements
1. New SearchInput component using fuse.js
2. Filter workspaces as user types
3. Keyboard shortcut: / to focus search

## Definition of Done
- [ ] SearchInput renders in sidebar
- [ ] Fuzzy matching works on workspace names
- [ ] Tests pass
```

### Plans

Multi-task initiatives that group related tasks:
- **Overview**: What the plan achieves
- **Task list**: Ordered tasks with dependencies
- **Success criteria**: How to know it's done
- **Risks and mitigations**

### Templates

Scaffolding templates for creating new AIDF files. DitLoop's `scaffold` command uses these to generate properly formatted files.

## Layered Context

AIDF context is applied in layers, with each layer adding specificity:

```
Global (AGENTS.md)          ← project-wide rules
  ↓
Role (roles/*.md)           ← persona behavior
  ↓
Skill (skills/*/SKILL.md)   ← specialized capability
  ↓
Task (tasks/*.md)           ← specific work item
  ↓
Plan (plans/*.md)           ← multi-task initiative
```

Later layers can override earlier ones. For example, a task might relax a general rule from AGENTS.md for its specific scope.

## Using AIDF with DitLoop

### Detect AIDF in a Project

DitLoop automatically detects `.ai/` folders in your workspaces and displays AIDF metadata in the dashboard.

### Scaffold New Files

```bash
ditloop scaffold task    # Interactive task creation
ditloop scaffold role    # Create a new role
ditloop scaffold skill   # Create a new skill
ditloop scaffold plan    # Create a multi-task plan
```

### Launch AI with Context

When you use the AI Launcher from the TUI dashboard, DitLoop injects the relevant AIDF context:

1. Loads AGENTS.md as base context
2. Applies the selected role
3. Includes relevant skills
4. Appends the current task/plan

This ensures the AI assistant has full project knowledge without manual copy-pasting.

## Best Practices

1. **Keep AGENTS.md focused** — project-level rules only, not task details
2. **One task per file** — each task should be self-contained
3. **Define clear scopes** — always specify allowed and forbidden files
4. **Write concrete DoD** — use checkboxes for acceptance criteria
5. **Use roles consistently** — match the role to the type of work
6. **Update regularly** — AIDF files should reflect the current state of the project
