# TASK: Update AIDF Context

## Goal
Update all .ai/ context files (AGENTS.md, roles, skills) to reflect the current v0.3 architecture including launcher, AIDF writer, template engine, and server package (v0.4).

## Scope

### Allowed
- .ai/AGENTS.md
- .ai/roles/*.md
- .ai/skills/**

### Forbidden
- Any source code changes
- .ai/plans/ (already up to date)
- .ai/tasks/ (managed separately)

## Requirements

### AGENTS.md
1. Update architecture section to include:
   - `launcher/` domain (context-builder, ai-launcher, cli-registry)
   - `aidf/writer/` and `aidf/template/` sub-modules
   - `server` package (if v0.4 is complete by then)
2. Update dependencies flow diagram
3. Add new domains to the structure per package section
4. Update conventions if any have evolved

### Roles
1. Review each role (architect, developer, documenter, reviewer, tester)
2. Update scope of knowledge to include v0.2/v0.3 modules
3. Ensure role definitions are still accurate for the current architecture

### Skills
1. Review each skill directory
2. Update skill definitions to reference new modules
3. Add skills for new capabilities if needed (e.g., server development, API testing)

## Definition of Done
- [ ] AGENTS.md accurately describes v0.3 architecture
- [ ] All roles reference current module structure
- [ ] Skills are up to date with current capabilities
- [ ] No references to outdated concepts (e.g., "chat engine", "session store")

## Status: 📋 Planned
