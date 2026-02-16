# PLAN: v0.8-Mobile — DitLoop Mobile & Tablet Companion

## Vision

Upgrade DitLoop's mobile PWA from a basic approval tool into a full companion app. Monitor workspaces, view AI sessions in real-time, approve/reject changes with swipe gestures, and launch tasks from your phone or tablet. Inspired by Claude Code mobile but designed for multi-project, multi-AI, multi-identity workflows.

**Design Reference:** SuperDesign mockups — 5 mobile screens + 2 tablet layouts

**Key Insight:** The mobile app is a remote control for your development environment, NOT a full IDE. It connects to the DitLoop server (v0.4) via WebSocket for real-time updates and REST API for actions.

---

## Architecture

### How it works

```
┌─────────────────────┐         ┌──────────────────┐
│   Mobile/Tablet PWA │ ──WS──▶ │  DitLoop Server  │
│                     │ ──REST─▶│  (v0.4 Hono)     │
│  React + Tailwind   │         │                  │
│  Service Workers    │◀──Push──│  Push Service    │
│  Offline Queue      │         │                  │
└─────────────────────┘         └──────────────────┘
                                       │
                                       ▼
                                ┌──────────────────┐
                                │  Desktop / TUI   │
                                │  (AI sessions)   │
                                └──────────────────┘
```

1. Mobile connects to DitLoop server via WebSocket (real-time events)
2. Server bridges to desktop/TUI where AI CLIs actually run
3. Mobile receives session output, approval requests, git status updates
4. User reviews diffs, approves/rejects, sends instructions
5. Native push notifications even when app is closed

### Technology Decision: React Native (not PWA)

The existing v0.5 PWA has limitations: iOS push requires "Add to Home Screen", no biometrics, limited background execution. For a proper companion app, we're going **React Native** (Expo):
- Native push notifications (APNs + FCM)
- Native haptics for swipe gestures
- Biometric auth (Face ID / fingerprint) for approval security
- Background execution for sync
- Shared TypeScript codebase with existing packages
- Expo for fast iteration + OTA updates

### Package Changes

- `@ditloop/mobile` — Rewrite as React Native (Expo) app, replacing PWA
- `@ditloop/web-ui` — Shared components (diff viewer, code blocks) adapted for RN
- `@ditloop/server` — New endpoints for session streaming, mobile-optimized payloads

---

## Task Breakdown

### Phase 1: Core Screens (Tasks M01–M03)

| Task | Name | Priority |
|------|------|----------|
| M01 | Workspace Hub (Home screen) | critical |
| M02 | Workspace Detail view | critical |
| M03 | Bottom navigation + routing | critical |

### Phase 2: AI Sessions (Tasks M04–M05)

| Task | Name | Priority |
|------|------|----------|
| M04 | AI Session view with live output | critical |
| M05 | Session instruction input + controls | high |

### Phase 3: Approval Workflow (Tasks M06–M08)

| Task | Name | Priority |
|------|------|----------|
| M06 | Approval Queue screen | critical |
| M07 | Diff Review view with file navigation | critical |
| M08 | Swipe gestures + approve/reject actions | high |

### Phase 4: Tablet Layouts (Tasks M09–M10)

| Task | Name | Priority |
|------|------|----------|
| M09 | Tablet Split View (workspace list + detail) | medium |
| M10 | Tablet Session & Approval (3-panel) | medium |

### Phase 5: Polish (Tasks M11–M12)

| Task | Name | Priority |
|------|------|----------|
| M11 | Push notifications for approvals | high |
| M12 | Offline mode + sync queue | medium |

---

## Task Details

### M01: Workspace Hub (Home screen)

**Goal:** Main mobile screen showing active AI sessions and all workspaces.

**Scope:** packages/mobile/src/

**Requirements:**
1. Top bar: "DitLoop" title, notification bell with badge, profile avatar (initials)
2. Search bar: filter workspaces by name
3. "Active Sessions" section: horizontal scroll cards
   - Each card: workspace name, branch badge, AI tool icon + name, "Running Xm", green pulse dot
   - Tap card → navigate to AI Session view
4. "All Workspaces" section: vertical scrollable list
   - Each row: number, workspace name, branch badge, identity email, provider badge (gh/bb/az)
   - Green dot = clean, orange asterisk = dirty
   - Tap row → navigate to Workspace Detail
5. FAB button (+): new workspace or new session
6. Pull-to-refresh for workspace status update

**Definition of Done:**
- [ ] Active Sessions cards with horizontal scroll
- [ ] Workspace list with all metadata
- [ ] Search filtering works
- [ ] Navigation to detail/session views
- [ ] Real-time updates via WebSocket
- [ ] Pull-to-refresh

---

### M02: Workspace Detail view

**Goal:** Per-workspace detail screen with tabs for overview, git, AIDF, and sessions.

**Scope:** packages/mobile/src/

**Requirements:**
1. Header: back arrow, workspace name, branch badge, "..." menu
2. Context chips: identity chip, AIDF tasks chip, provider chip
3. Tab bar: Overview | Git | AIDF | Sessions
4. Overview tab:
   - Git Status card: progress bar (green/orange/gray), staged/changes/untracked counts
   - Recent Commits: last 3-5, hash + message + time ago
   - AIDF Context card: Role, Active Task, Plan
   - Quick actions: "Launch AI" (teal), "Commit", "Push"
5. Git tab: full file list with staged/unstaged/untracked sections, stage/unstage actions
6. AIDF tab: roles, tasks, plans loaded for this workspace
7. Sessions tab: list of AI sessions (active + recent) for this workspace

**Definition of Done:**
- [ ] All 4 tabs render correctly
- [ ] Git status updates in real-time
- [ ] Quick actions trigger server API calls
- [ ] AIDF context loads from workspace
- [ ] Recent commits display correctly

---

### M03: Bottom navigation + routing

**Goal:** Tab-based navigation with 4 sections: Home, Sessions, Approvals, Settings.

**Scope:** packages/mobile/src/

**Requirements:**
1. Bottom tab bar: Home (house icon), Sessions (terminal icon), Approvals (checkmark icon + badge), Settings (gear icon)
2. Approvals badge shows pending count (red/orange dot with number)
3. React Router navigation between sections
4. Preserve scroll position when switching tabs
5. Deep linking support: `ditloop://approvals/123` opens specific approval

**Definition of Done:**
- [ ] 4-tab navigation works
- [ ] Badge count updates in real-time
- [ ] Deep linking works
- [ ] Scroll position preserved

---

### M04: AI Session view with live output

**Goal:** Real-time view of an AI CLI session running on desktop/TUI, with rendered code blocks and approval banners.

**Scope:** packages/mobile/src/

**Requirements:**
1. Header: back arrow, "Claude Session" (or AI tool name), workspace badge, session duration
2. Output area: scrollable, auto-scroll to bottom
   - AI messages with avatar icon
   - Rendered markdown (bold, inline code, headers)
   - Code blocks with syntax highlighting (dark bg, colored syntax)
   - File references as tappable links
3. "Pending Approval" banner (orange) when AI proposes changes:
   - File count: "3 files changed by Claude"
   - "Reject" button (outline) + "Review Changes" button (teal)
4. Auto-scroll with "scroll to bottom" button when user scrolls up
5. Connection status indicator (connected/reconnecting/offline)

**Definition of Done:**
- [ ] Live streaming output from server via WebSocket/SSE
- [ ] Code blocks with syntax highlighting
- [ ] Pending approval banner appears on approval events
- [ ] Auto-scroll behavior correct
- [ ] Connection status visible

---

### M05: Session instruction input + controls

**Goal:** Send instructions to running AI session from mobile, and control session (pause/resume/stop).

**Scope:** packages/mobile/src/

**Requirements:**
1. Input bar at bottom: text field "Send instruction...", attach button, send arrow
2. Send instruction → forwarded to AI CLI session on desktop/TUI via server
3. Session controls in "..." menu: Pause, Resume, Stop, Restart
4. Keyboard avoidance: input stays visible when keyboard is open
5. Instruction history (swipe up to see previous instructions)

**Definition of Done:**
- [ ] Input sends instructions to server → AI session
- [ ] Session control actions work
- [ ] Keyboard avoidance correct on iOS + Android
- [ ] Instruction history accessible

---

### M06: Approval Queue screen

**Goal:** Centralized view of all pending, approved, and rejected approval requests across all workspaces.

**Scope:** packages/mobile/src/

**Requirements:**
1. Header: "Approvals" title, notification bell, profile avatar
2. Filter chips: All | Pending | Approved | Rejected
3. Approval cards list:
   - Workspace name, AI tool badge, file count icon, time ago, status badge (PENDING/APPROVED/REJECTED)
   - Color coding: orange pending, green approved, red rejected
4. Tap card → navigate to Diff Review view
5. Batch actions: "Approve All Pending" button
6. Pull-to-refresh
7. Real-time updates: new approvals appear automatically

**Definition of Done:**
- [ ] Filter chips work correctly
- [ ] Approval cards render with all metadata
- [ ] Navigation to diff review works
- [ ] Real-time updates via WebSocket
- [ ] Batch approve works

---

### M07: Diff Review view with file navigation

**Goal:** Mobile-optimized unified diff viewer with file tab navigation and per-file approve/reject.

**Scope:** packages/mobile/src/, packages/web-ui/src/ (shared diff component)

**Requirements:**
1. Header: "Review Changes", file counter "2/3 FILES"
2. File tabs: horizontal scroll, tap to switch files
   - Each tab: filename, colored dot (modified/added/deleted)
3. Unified diff view:
   - Line numbers (left column)
   - Red background for removed lines with `-` prefix
   - Green background for added lines with `+` prefix
   - Gray context lines
   - Hunk headers (`@@ -102,4 +106,7 @@`)
4. Swipe gestures: left = reject, right = approve (with haptic feedback)
5. Gesture hint arrows shown at bottom: `← REJECT` / `APPROVE →`
6. Action buttons: "Reject File" (red), "Approve File" (teal)
7. "Approve All Changes" button (green, full width) at very bottom
8. Pinch-to-zoom on diff for small screens

**Definition of Done:**
- [ ] Unified diff renders correctly with colors
- [ ] File tab navigation works
- [ ] Swipe gestures with haptic feedback
- [ ] Per-file and bulk approve/reject
- [ ] Pinch-to-zoom works

---

### M08: Swipe gestures + approve/reject actions

**Goal:** Natural gesture-based approval workflow with haptic feedback and animations.

**Scope:** packages/mobile/src/

**Requirements:**
1. Swipe right on approval card → approve (green slide animation)
2. Swipe left on approval card → reject (red slide animation)
3. Haptic feedback on swipe threshold
4. Undo toast: "Approved ditloop changes. Undo?" (5 second timeout)
5. Swipe on individual files in diff view
6. Long press on approval card → context menu (Approve, Reject, View Diff, Ignore)
7. Gesture tutorial on first use

**Definition of Done:**
- [ ] Swipe gestures on approval cards
- [ ] Swipe gestures on diff files
- [ ] Haptic feedback works
- [ ] Undo toast with timer
- [ ] First-use tutorial

---

### M09: Tablet Split View (workspace list + detail)

**Goal:** iPad/tablet optimized layout with persistent workspace sidebar and detail panel.

**Scope:** packages/mobile/src/

**Requirements:**
1. Left panel (30%): workspace list with search, provider badges, identity
   - Active workspace highlighted with green dot
   - Tap workspace → loads in right panel
2. Right panel (70%): workspace detail with tabs (Overview, Git Status, AIDF Sessions, Tasks)
   - Git Status and AIDF Context cards side-by-side (2-column grid)
   - "Launch AI Assistant" prominent button
   - Recent commits below
3. Status bar at bottom: identity | branch | AI status | connection | errors | version
4. "Switch Branch" button in header
5. Responsive: switch to single-column below 768px width

**Definition of Done:**
- [ ] Split view renders correctly on iPad
- [ ] Workspace selection updates right panel
- [ ] Status bar shows all segments
- [ ] Responsive breakpoint works
- [ ] Cards layout in 2-column grid on tablet

---

### M10: Tablet Session & Approval (3-panel)

**Goal:** Triple-panel tablet layout showing session list, output console, and diff review simultaneously.

**Scope:** packages/mobile/src/

**Requirements:**
1. Left panel (25%): Active sessions list
   - Each card: workspace, AI tool + model, identity, status (In progress/Paused/Idle), time ago
   - Tap to focus session in center panel
   - "+ New Session" button at bottom
2. Center panel (40%): Output Console
   - Session output with rendered code blocks
   - "Pending Approval" banner inline
   - Input bar: "Send instructions to Claude..." + attach + send
3. Right panel (35%): Diff Review
   - File tabs
   - Unified diff with line numbers
   - "Approve This File" with keyboard shortcut hint (Cmd+Return)
   - "Reject All" / "Approve All" buttons
4. Status bar at bottom: `MAIN* | personal | API Connected | AIDF Active: 2 tasks | 3 pending reviews`
5. Panel resize handles (drag borders)

**Definition of Done:**
- [ ] 3-panel layout renders on tablet landscape
- [ ] Session selection loads output + diff
- [ ] Keyboard shortcuts work with external keyboard
- [ ] Status bar shows all context
- [ ] Panel resize works

---

### M11: Push notifications for approvals

**Goal:** Native push notifications when AI sessions need human approval, even when app is closed.

**Scope:** packages/mobile/src/, packages/server/src/

**Requirements:**
1. VAPID-based Web Push notifications (already exists in v0.5, enhance)
2. Notification types:
   - "Approval needed: Claude changed 3 files in ditloop" (actionable: Approve/Review)
   - "Session paused: onyxodds-api waiting for input"
   - "Session completed: solu-webapp — 5 files changed"
3. Tap notification → deep link to approval view
4. Notification grouping by workspace
5. Quiet hours setting (don't disturb between 10pm-8am)
6. Per-workspace notification preferences

**Definition of Done:**
- [ ] Push notifications arrive when app is closed
- [ ] Tap opens correct approval
- [ ] Notification grouping works
- [ ] Quiet hours setting works
- [ ] Per-workspace preferences

---

### M12: Offline mode + sync queue

**Goal:** App works offline with queued actions that sync when connection returns.

**Scope:** packages/mobile/src/

**Requirements:**
1. Service Worker caches workspace list, recent sessions, approval queue
2. Offline indicator banner: "Offline — actions will sync when connected"
3. Offline actions queued: approve, reject, send instruction
4. On reconnect: sync queue in order, show "Syncing X actions..." toast
5. Conflict resolution: if approval was already handled by desktop, skip with notification
6. Last-synced timestamp on each workspace card

**Definition of Done:**
- [ ] App loads cached data when offline
- [ ] Actions queue correctly
- [ ] Sync on reconnect works
- [ ] Conflict resolution handles duplicates
- [ ] Last-synced timestamp visible

---

## Dependencies

```
Phase 1 (Core Screens)
  M01 (Home) ← independent
  M02 (Detail) ← independent
  M03 (Navigation) ← independent, parallel with M01+M02

Phase 2 (AI Sessions) — depends on M03
  M04 (Session view) ← depends on M03
  M05 (Session input) ← depends on M04

Phase 3 (Approval Workflow) — depends on M03
  M06 (Approval queue) ← depends on M03
  M07 (Diff review) ← depends on M06
  M08 (Swipe gestures) ← depends on M07

Phase 4 (Tablet) — depends on M01+M02+M04+M07
  M09 (Tablet split) ← depends on M01, M02
  M10 (Tablet 3-panel) ← depends on M04, M07

Phase 5 (Polish) — can start anytime after Phase 2
  M11 (Push notifications) ← depends on M06
  M12 (Offline mode) ← independent
```

**Critical path:** M03 → M04 → M05 (sessions) + M06 → M07 → M08 (approvals)

**Parallelizable:** M01/M02/M03 can all start simultaneously. M09/M10 can start once their deps are met. M12 is independent.

---

## Risks

1. **WebSocket reliability on mobile** — Mobile connections drop frequently. Mitigation: automatic reconnect with exponential backoff, offline queue (M12).
2. **Code block rendering performance** — Large AI outputs with many code blocks may lag on older phones. Mitigation: virtualized list, lazy syntax highlighting.
3. **Swipe gesture conflicts** — iOS back swipe vs approval swipe. Mitigation: swipe threshold, only activate on horizontal swipe inside approval cards.
4. **PWA limitations** — Push notifications on iOS require user to add to home screen. Mitigation: clear onboarding explaining setup.
5. **Diff viewer on small screens** — Unified diff on 390px width is tight. Mitigation: horizontal scroll, pinch-to-zoom, landscape mode hint.

---

## Success Criteria

- [ ] Workspace Hub shows all workspaces with real-time status
- [ ] AI session output streams live to mobile
- [ ] Approve/reject from mobile updates desktop in < 2 seconds
- [ ] Swipe gestures feel native and responsive
- [ ] Tablet 3-panel layout works for review workflow
- [ ] Push notifications arrive within 5 seconds of approval request
- [ ] App works offline with queued actions
- [ ] All existing v0.5 mobile tests still passing

---

## Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: Core Screens | M01–M03 | 1 week |
| Phase 2: AI Sessions | M04–M05 | 1 week |
| Phase 3: Approval Workflow | M06–M08 | 1–2 weeks |
| Phase 4: Tablet Layouts | M09–M10 | 1 week |
| Phase 5: Polish | M11–M12 | 1 week |
| **Total** | **M01–M12** | **~4–5 weeks** |

---

**Plan created:** February 16, 2026
**Version:** v0.8-Mobile
**Status:** PLANNED
**Depends on:** v0.4 (Server) ✅ + v0.5 (Mobile PWA) ✅
**Branch:** `feat/v08-mobile`
**Tasks:** M01–M12 (12 tasks across 5 phases)
**Parallel with:** v0.8-IDE (Desktop) + v0.8-TUI (Terminal)
