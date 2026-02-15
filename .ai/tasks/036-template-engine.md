# TASK: Template Engine

## Goal
Implement TemplateEngine for loading AIDF templates, variable interpolation, and providing built-in templates for common AIDF types.

## Scope

### Allowed
- packages/core/src/aidf/template/template-engine.ts
- packages/core/src/aidf/template/template-engine.test.ts
- packages/core/src/aidf/template/index.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. Load templates from .ai/templates/ directory
2. Variable interpolation using {{var}} syntax
3. Built-in templates: task, role, skill, plan, bug-fix, feature
4. Template listing and preview functionality
5. Support conditional blocks and loops
6. Template validation before rendering

## Definition of Done
- [ ] Template loading from filesystem
- [ ] Variable interpolation working
- [ ] All built-in templates included
- [ ] Conditional and loop support
- [ ] Unit tests for all template features

## Status: 📋 Planned
