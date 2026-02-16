# PLAN: v0.5 Mobile Integration

## Overview

Progressive Web App for accessing DitLoop from any device. Review and approve AI changes from your phone, chat with AI, monitor executions, receive push notifications. New `@ditloop/mobile` package with React DOM + Tailwind + Vite.

## Goals

- Installable PWA with offline shell
- Touch-optimized workspace browser
- Mobile chat interface with streaming
- Swipe-based approval workflow with diff viewer
- Execution monitoring with live output
- Push notifications for approvals and completions
- Real-time state sync across all clients
- Configurable notification preferences

## Non-Goals

- Native iOS/Android apps (PWA only)
- Code editing on mobile (read-only diffs)
- Offline task execution (requires server)
- File system access from mobile
- Native push (APNs/FCM) — Web Push only

## Tasks

### Mobile PWA (045-049)

New `packages/mobile/` with Vite + React DOM + Tailwind CSS.

- [ ] `045-mobile-package.md` — Package setup, PWA manifest, service worker, connection setup, dark mode
- [ ] `046-mobile-workspace-view.md` — Workspace cards, pull-to-refresh, detail view, search
- [ ] `047-mobile-chat-view.md` — Chat with streaming, code blocks, connection indicator
- [ ] `048-mobile-approval-view.md` — Approval list, diff viewer, swipe approve/reject, risk badges
- [ ] `049-mobile-execution-view.md` — Execution list, live output stream, cancel

**045 first, then 046-049 all parallelizable**

### Push Notifications & Sync (050-052)

Real-time notifications and state sync in `packages/server/src/notifications/` and `packages/server/src/sync/`.

- [ ] `050-push-notification-service.md` — Web Push API, VAPID keys, subscription management, 4 notification types
- [ ] `051-state-sync-engine.md` — Delta updates over WebSocket, conflict resolution, offline event queue
- [ ] `052-notification-preferences.md` — Config schema, quiet hours, event toggles, workspace filters, CLI + mobile UI

**050 and 051 parallelizable, 052 depends on 050**

## Dependencies

- Vite (build)
- React DOM + Tailwind CSS (UI)
- Workbox (service worker)
- `web-push` (push notifications on server)
- v0.4 complete (server API)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari PWA limitations | Medium | High | Test on iOS 16.4+, fallback instructions |
| WebSocket drops on mobile networks | High | Medium | Exponential backoff reconnection, event queue |
| Push notifications blocked by browser | High | High | Clear permission prompts, in-app fallback |
| Large diffs crash mobile browser | Low | Medium | Virtualize rendering, truncation |
| Touch gestures conflict with scroll | Medium | Medium | Tune thresholds, provide button alternatives |

## Success Criteria

- [ ] PWA installs on iOS Safari and Android Chrome
- [ ] Workspaces load with pull-to-refresh
- [ ] Chat streams AI responses in real-time
- [ ] Swipe approve/reject works reliably
- [ ] Execution output streams live
- [ ] Push notifications delivered within 5s
- [ ] State syncs across TUI and mobile in <1s
- [ ] Quiet hours prevent notifications correctly
- [ ] Works offline with cached shell
- [ ] All tests pass
