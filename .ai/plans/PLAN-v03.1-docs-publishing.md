# PLAN: v0.3.1 Documentation, Dogfooding & GitHub Pages

## Overview

Prepare DitLoop for real-world usage and public visibility. Create all OSS documentation (README, LICENSE, CONTRIBUTING), update internal AIDF files to reflect current architecture, set up GitHub Pages with landing page + docs, and make the CLI installable locally via `pnpm link`.

This is a parallel effort alongside v0.4 (Server & API). It does not modify any source code in packages — only documentation, configuration, and static site files.

## Philosophy

**Document what exists, not what's planned.** The README and docs should reflect v0.3 (current shipped state). Future features belong in the ROADMAP, not the README.

## Goals

- CLI runnable locally via `pnpm link --global`
- README.md with installation, usage, architecture overview
- LICENSE file (MIT)
- CONTRIBUTING.md with dev setup, conventions, PR guidelines
- Updated .ai/ files (AGENTS.md, roles, skills) reflecting v0.3 state
- GitHub Pages site with landing page + documentation
- Package.json metadata ready for eventual npm publish

## Non-Goals

- Publishing to npm (not yet — dogfood first)
- CI/CD pipelines (separate initiative)
- Automated API documentation generation
- i18n / translations
- Blog or changelog page

## Tasks

### OSS Readiness (D01-D03)

Root-level documentation for the open-source project.

- [ ] `D01-readme-and-license.md` — README.md (root + per-package), LICENSE, .npmignore, package.json metadata
- [ ] `D02-contributing-guide.md` — CONTRIBUTING.md with dev setup, file conventions, testing, commit guidelines
- [ ] `D03-dogfooding-setup.md` — pnpm link setup, real config.yaml, verify CLI commands work end-to-end

**D01 first, D02 and D03 parallelizable**

### AIDF Update (D04)

Bring internal AI context files up to date.

- [ ] `D04-update-aidf-context.md` — Update AGENTS.md, roles, skills to reflect v0.3 architecture (launcher, writer, templates, server package)

**Independent, parallelizable with everything**

### GitHub Pages (D05-D06)

Public-facing site at `rubenmavarezb.github.io/ditloop`.

- [ ] `D05-docs-site-setup.md` — VitePress or Starlight setup in `docs/`, deploy via GitHub Actions
- [ ] `D06-landing-and-docs.md` — Landing page (hero, features, install), docs pages (getting started, architecture, CLI reference, AIDF guide)

**D05 first, D06 depends on D05**

## Dependencies

- No code dependencies — purely documentation and configuration
- GitHub Pages enabled on the repo
- v0.3 complete (to document current features)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Docs become outdated quickly | High | Medium | Keep docs minimal, link to ROADMAP for future features |
| GitHub Pages build fails | Low | Low | Simple static site, test locally first |
| pnpm link breaks with workspace deps | Medium | Medium | Test on clean terminal session, document workarounds |
| AIDF files diverge from actual code | Medium | Medium | D04 runs a code audit, not guesswork |

## Success Criteria

- [ ] `pnpm link --global` makes `ditloop` command available system-wide
- [ ] `ditloop --help`, `ditloop workspace list`, `ditloop profile current` work
- [ ] README.md has install, usage, and architecture sections
- [ ] LICENSE file exists (MIT)
- [ ] CONTRIBUTING.md has dev setup instructions that work from scratch
- [ ] AGENTS.md reflects v0.3 modules (launcher, writer, template, server)
- [ ] GitHub Pages site is live with landing page
- [ ] Docs site has at least: Getting Started, Architecture, CLI Reference
- [ ] All package.json files have description, repository, keywords
