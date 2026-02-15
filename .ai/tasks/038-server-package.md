# TASK: Server Package

## Goal
Create new packages/server with REST API using Fastify or Hono, providing endpoints for workspaces, profiles, and sessions with token authentication.

## Scope

### Allowed
- packages/server/src/**
- packages/server/package.json
- packages/server/tsconfig.json
- packages/server/tsup.config.ts

### Forbidden
- packages/core/** (import only)
- packages/tui/**

## Requirements
1. REST routes: /api/workspaces, /api/profiles, /api/sessions
2. Token authentication from ~/.ditloop/server-token
3. CORS configuration for local PWA access
4. JSON request/response handling
5. Error handling with proper HTTP status codes
6. OpenAPI documentation generation

## Definition of Done
- [ ] Server starts and handles requests
- [ ] All REST endpoints functional
- [ ] Token auth middleware working
- [ ] CORS properly configured
- [ ] Integration tests for all endpoints

## Status: 📋 Planned
