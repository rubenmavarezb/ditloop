# TASK: README & License

## Goal
Create root README.md, per-package READMEs, LICENSE file, and prepare package.json metadata for eventual npm publishing.

## Scope

### Allowed
- README.md (root)
- packages/core/README.md
- packages/ui/README.md
- packages/tui/README.md
- packages/server/README.md
- LICENSE
- .npmignore
- package.json (root + all packages — metadata fields only)

### Forbidden
- Any source code changes
- Any .ai/ files (handled by D04)

## Requirements

### Root README.md
1. Hero section: project name, tagline, badges (build, license, version)
2. What is DitLoop: 2-3 sentence description
3. Key features list (workspace management, git identity, AI CLI launcher, AIDF, TUI dashboard)
4. Quick start: install, create config, run
5. CLI reference table (all commands with description)
6. Architecture diagram (text-based: packages and their relationships)
7. Screenshots section (placeholder for now)
8. Links to: CONTRIBUTING.md, ROADMAP, LICENSE, docs site

### Per-Package READMEs
1. Package name and description
2. Installation (as dependency)
3. Key exports / API surface
4. Link to root README for full docs

### LICENSE
1. MIT License with correct year and author

### Package.json Metadata
1. All packages: `description`, `repository`, `keywords`, `author`, `license`, `homepage`
2. `@ditloop/tui`: verify `bin`, `files` fields are correct for CLI distribution
3. Root: keep `private: true` (monorepo root should not be published)

## Definition of Done
- [ ] Root README.md renders correctly on GitHub
- [ ] Each package has a README.md
- [ ] LICENSE file exists with MIT text
- [ ] All package.json files have complete metadata
- [ ] `files` field in @ditloop/tui includes dist/ only

## Status: 📋 Planned
