# TASK: Server Package

## Goal
Create new `packages/server` with Hono HTTP server providing REST endpoints for workspaces, profiles, AIDF context, and AI launcher with token authentication.

## Scope

### Allowed
- packages/server/** (new package)
- pnpm-workspace.yaml (add server)
- turbo.json (add server tasks)

### Forbidden
- packages/core/** (import only)
- packages/tui/**

## Requirements
1. New `@ditloop/server` package with Hono (lightweight, TypeScript-native)
2. REST routes:
   - GET /api/workspaces — list all workspaces via WorkspaceManager
   - GET /api/workspaces/:id — workspace detail with git status
   - GET /api/workspaces/:id/aidf — AIDF context via ContextBuilder
   - GET /api/profiles — list all profiles
   - GET /api/profiles/current — active profile
   - POST /api/launch — trigger AI CLI in non-interactive mode via AiLauncher
   - GET /api/launch/available — list detected AI CLIs
   - GET /api/health — server health check
3. Token authentication middleware — read token from `~/.ditloop/server-token`, auto-generate on first start
4. CORS configuration for localhost PWA access (configurable origins)
5. JSON request/response with proper error handling (4xx/5xx with error body)
6. Server reads config from existing DitLoopConfig (`server: { enabled, port, host }`)

## Definition of Done
- [ ] Server starts on configured port and handles requests
- [ ] All REST endpoints return correct JSON
- [ ] Token auth middleware blocks unauthorized requests
- [ ] CORS properly configured
- [ ] Health endpoint returns server status
- [ ] Integration tests for all endpoints

## Status: 📋 Planned
