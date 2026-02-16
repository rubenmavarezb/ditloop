# TASK: AI Session view with live output

## Goal
Real-time view of an AI CLI session running on desktop/TUI, with rendered code blocks, markdown, and approval banners.

## Scope

### Allowed
- packages/mobile/src/

### Forbidden
- packages/core/**
- packages/desktop/**

## Requirements
1. Header: back arrow, AI tool name (e.g. "Claude Session"), workspace badge, session duration
2. Output area: scrollable, auto-scroll to bottom
   - AI messages with avatar icon
   - Rendered markdown (bold, inline code, headers)
   - Code blocks with syntax highlighting
3. "Pending Approval" banner (orange) when AI proposes changes
   - File count, "Reject" button, "Review Changes" button
4. Auto-scroll with "scroll to bottom" button when user scrolls up
5. Connection status indicator

## Definition of Done
- [ ] Live streaming output from server via WebSocket/SSE
- [ ] Code blocks with syntax highlighting
- [ ] Pending approval banner appears on approval events
- [ ] Auto-scroll behavior correct
- [ ] Connection status visible

## Metadata
- **Version**: v0.8-Mobile
- **Phase**: Phase 2: AI Sessions
- **Priority**: critical
- **Package**: @ditloop/mobile
- **Plan task ID**: M04
- **Depends on**: 112

## Status: planned
