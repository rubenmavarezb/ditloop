# TASK: Docs Site Setup

## Goal
Set up a documentation site using VitePress (or Starlight) in `docs/` directory with GitHub Actions deployment to GitHub Pages.

## Scope

### Allowed
- docs/** (new directory)
- .github/workflows/docs.yml (new)
- package.json (root — add docs scripts)

### Forbidden
- Any source code changes in packages/

## Requirements
1. VitePress setup in `docs/` with:
   - Config file with site title, description, nav, sidebar
   - Dark mode support (default)
   - Search enabled
   - Logo/favicon placeholder
2. Directory structure:
   ```
   docs/
   ├── .vitepress/config.ts
   ├── index.md          (landing/home page)
   ├── guide/
   │   ├── getting-started.md
   │   ├── architecture.md
   │   └── cli-reference.md
   ├── aidf/
   │   └── overview.md
   └── public/
       └── (logo, favicon)
   ```
3. GitHub Actions workflow:
   - Trigger on push to main (docs/** path filter)
   - Build VitePress
   - Deploy to GitHub Pages
4. Root package.json scripts:
   - `docs:dev` — local dev server
   - `docs:build` — production build
5. Test locally before deploying

## Definition of Done
- [ ] `pnpm docs:dev` starts local docs server
- [ ] `pnpm docs:build` produces static site
- [ ] GitHub Actions workflow file exists
- [ ] Site has correct nav structure and dark mode
- [ ] Deploys successfully to GitHub Pages

## Status: 📋 Planned
