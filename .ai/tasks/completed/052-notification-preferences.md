# TASK: Notification Preferences

## Goal
Implement notification preferences in config with CLI commands, mobile settings screen, and server-side enforcement.

## Scope

### Allowed
- packages/core/src/config/schema.ts (extend)
- packages/tui/src/commands/notifications.ts
- packages/server/src/notifications/preferences.ts

### Forbidden
- packages/mobile/** (mobile reads from API)

## Requirements
1. Config schema: enabled, quiet_hours (start/end), event toggles, workspace filters
2. CLI: `ditloop config notifications` subcommands (enable, disable, set-quiet-hours, toggle-event)
3. Mobile settings screen reads/writes via API
4. Server enforces preferences before sending notifications
5. Default preferences: all enabled, no quiet hours
6. Per-workspace overrides

## Definition of Done
- [ ] Config schema extended with preferences
- [ ] CLI commands functional
- [ ] Server enforces preferences
- [ ] API endpoints for mobile
- [ ] Unit tests for all preference logic

## Status: 📋 Planned
