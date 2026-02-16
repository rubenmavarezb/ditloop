# Fix Prompt — v0.5 Mobile PWA Review Issues

## Context

DitLoop v0.5 Mobile PWA has been reviewed. Build passes, but the mobile package has **zero tests**. Server-side tasks (050-052) were already tested in v0.4. This prompt addresses 11 issues (3 CRITICAL, 8 MEDIUM). LOW issues are cosmetic and deferred.

**IMPORTANT:** Run `pnpm build` after changes. For mobile tests, add `vitest` and a `test` script to `packages/mobile/package.json` first (Fix 1).

---

## Fix 1 — CRITICAL: Add test infrastructure and tests for mobile package

**Problem:** Zero test files exist. No vitest dependency, no test script. The DoD for every mobile task (045-049) requires tests.

**Files:**

### Step 1: Add vitest to mobile package

In `packages/mobile/package.json`, add to `devDependencies`:
```json
"vitest": "^3.0.0",
"jsdom": "^26.0.0",
"@testing-library/react": "^16.0.0",
"@testing-library/jest-dom": "^6.0.0"
```

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

### Step 2: Create vitest config

Create `packages/mobile/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
```

### Step 3: Create test files

Create co-located tests for the most important modules:

**`packages/mobile/src/api/client.test.ts`** — Test `apiFetch` and `checkHealth`:
1. `apiFetch` adds Authorization header
2. `apiFetch` throws ApiError on non-ok response
3. `apiFetch` throws when not connected (no URL/token)
4. `checkHealth` returns true on 200
5. `checkHealth` returns false on network error

**`packages/mobile/src/api/websocket.test.ts`** — Test `DitLoopWebSocket`:
1. `connect()` reads URL and token from store
2. `disconnect()` sets intentionallyClosed and updates store status
3. `onMessage()` returns unsubscribe function
4. `isConnected` returns false when no connection

**`packages/mobile/src/store/connection.test.ts`** — Test connection store:
1. Initial state has empty URL, token, disconnected
2. `configure()` sets URL, token, configured=true
3. `configure()` strips trailing slashes from URL
4. `disconnect()` resets to initial state
5. `setStatus()` updates status and error

**`packages/mobile/src/hooks/useApiFetch.test.ts`** — Test the hook:
1. Returns loading=true initially
2. Sets data after successful fetch
3. Sets error on ApiError
4. `refetch()` re-fetches data

Mock `apiFetch` using `vi.mock('../api/client.js')`.

**Verification:** `pnpm test --filter @ditloop/mobile` passes with new tests.

---

## Fix 2 — CRITICAL: Don't persist token in localStorage

**Problem:** The Bearer auth token is persisted to localStorage via Zustand `persist`. localStorage is accessible to any script on the same origin, making it vulnerable to XSS. For a PWA, this is a real risk.

**File:** `packages/mobile/src/store/connection.ts`

**Action:** Use `sessionStorage` instead of `localStorage`. Zustand persist supports custom storage adapters:

Replace lines 59-66:
```typescript
// Before
{
  name: 'ditloop-connection',
  partialize: (state) => ({
    serverUrl: state.serverUrl,
    token: state.token,
    configured: state.configured,
  }),
}

// After
{
  name: 'ditloop-connection',
  storage: {
    getItem: (name) => {
      // URL from localStorage (persists across sessions)
      const saved = localStorage.getItem(name);
      // Token from sessionStorage (cleared on tab close)
      const tokenData = sessionStorage.getItem(`${name}-token`);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (tokenData) {
        const tokenParsed = JSON.parse(tokenData);
        parsed.state.token = tokenParsed.token;
        parsed.state.configured = !!tokenParsed.token;
      } else {
        // No token in session — user must re-enter
        parsed.state.token = '';
        parsed.state.configured = false;
      }
      return parsed;
    },
    setItem: (name, value) => {
      const data = JSON.parse(JSON.stringify(value));
      // Store token separately in sessionStorage
      const token = data.state?.token ?? '';
      sessionStorage.setItem(`${name}-token`, JSON.stringify({ token }));
      // Strip token from localStorage
      if (data.state) {
        data.state.token = '';
      }
      localStorage.setItem(name, JSON.stringify(data));
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
      sessionStorage.removeItem(`${name}-token`);
    },
  },
  partialize: (state) => ({
    serverUrl: state.serverUrl,
    token: state.token,
    configured: state.configured,
  }),
}
```

This keeps the serverUrl in localStorage (persists across sessions) but moves the token to sessionStorage (cleared when tab closes). Users will need to re-enter the token on new sessions but not the URL.

**Verification:** Token no longer appears in `localStorage` (check devtools). Connection still works after page refresh within the same session.

---

## Fix 3 — CRITICAL: Send WebSocket token via first message instead of URL

**Problem:** Token in `?token=...` query parameter gets logged by proxies, CDNs, load balancers, and server access logs. The server already supports `Authorization: Bearer` on upgrade, but the standard browser WebSocket API doesn't support custom headers.

**File:** `packages/mobile/src/api/websocket.ts`

**Action:** Since browsers don't support custom headers on WebSocket, and the server already accepts `?token=`, the pragmatic fix is to document the tradeoff and ensure the server doesn't log the full URL. However, a better approach is to use a short-lived ticket:

**Option A (Pragmatic — document the tradeoff):** Add a comment explaining the security limitation:

```typescript
// Browser WebSocket API does not support custom headers (Authorization).
// Token is passed via query parameter as a necessary compromise.
// The server should NOT log full WebSocket upgrade URLs.
const wsUrl = serverUrl.replace(/^http/, 'ws') + `/ws?token=${encodeURIComponent(token)}`;
```

**Option B (Better — ticket exchange):** Add a `POST /api/ws-ticket` endpoint to the server that exchanges the Bearer token for a single-use, short-lived ticket (e.g., 30s TTL). The client fetches the ticket, then connects with `?ticket=...`. This limits exposure.

For now, go with **Option A** (document). Option B can be added later.

**Verification:** N/A (documentation only for Option A).

---

## Fix 4 — MEDIUM: Extract shared Approval types to a common file

**Problem:** `RiskLevel`, `Approval`, and `RISK_COLORS` are defined identically in both `ApprovalList.tsx` and `ApprovalDetail.tsx`.

**Action:** Create `packages/mobile/src/views/Approvals/approval.types.ts`:

```typescript
/** Risk level classification for an approval. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Approval record from the server API. */
export interface Approval {
  id: string;
  description: string;
  riskLevel: RiskLevel;
  diff?: string;
  workspace?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'denied';
}

/** Risk level badge color mapping. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};
```

Remove the duplicate definitions from both files and import:
```typescript
import { type RiskLevel, type Approval, RISK_COLORS } from './approval.types.js';
```

**Verification:** `pnpm build --filter @ditloop/mobile` succeeds. No duplicate types.

---

## Fix 5 — MEDIUM: Extract shared execution constants

**Problem:** `STATUS_DOT_CLASSES` and `STATUS_LABELS` are defined identically in `ExecutionCard.tsx` and `ExecutionDetail.tsx`.

**Action:** Since `ExecutionCard` already exports `ExecutionStatus` and `Execution`, add the constants to `ExecutionCard.tsx` as named exports:

In `packages/mobile/src/components/ExecutionCard/ExecutionCard.tsx`, change lines 23-39 to exported:
```typescript
/** Map execution status to dot styling classes. */
export const STATUS_DOT_CLASSES: Record<ExecutionStatus, string> = {
  // ... same as before
};

/** Map execution status to human-readable label. */
export const STATUS_LABELS: Record<ExecutionStatus, string> = {
  // ... same as before
};
```

Update the barrel `packages/mobile/src/components/ExecutionCard/index.ts` to export them.

In `packages/mobile/src/views/Executions/ExecutionDetail.tsx`, remove the local copies (lines 7-23) and import:
```typescript
import { STATUS_DOT_CLASSES, STATUS_LABELS } from '../../components/ExecutionCard/index.js';
import type { Execution, ExecutionStatus } from '../../components/ExecutionCard/index.js';
```

**Verification:** `pnpm build --filter @ditloop/mobile` succeeds. No duplicate constants.

---

## Fix 6 — MEDIUM: Extract ConfirmDialog to shared component

**Problem:** The confirmation dialog for critical approvals is implemented inline in both `ApprovalList.tsx` (lines 353-385) and `ApprovalDetail.tsx` (lines 177-207).

**Action:** Create `packages/mobile/src/components/ConfirmDialog/ConfirmDialog.tsx`:

```typescript
/** Props for the ConfirmDialog component. */
export interface ConfirmDialogProps {
  /** Title text (e.g. "Confirm Approve"). */
  title: string;
  /** Body message. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel: string;
  /** Tailwind color class for the confirm button. */
  confirmColor: string;
  /** Callback when confirmed. */
  onConfirm: () => void;
  /** Callback when cancelled. */
  onCancel: () => void;
}

/**
 * Modal confirmation dialog with overlay.
 *
 * @param props - Dialog props
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
        <p className="mb-6 text-sm text-slate-400">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white active:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Create barrel `packages/mobile/src/components/ConfirmDialog/index.ts`:
```typescript
export { ConfirmDialog } from './ConfirmDialog.js';
export type { ConfirmDialogProps } from './ConfirmDialog.js';
```

Export from `packages/mobile/src/components/index.ts`.

Update both `ApprovalList.tsx` and `ApprovalDetail.tsx` to use the shared component instead of inline JSX.

In `ApprovalList.tsx`, replace the `ConfirmDialog` function component (lines 341-385) with an import and usage:
```typescript
import { ConfirmDialog } from '../../components/ConfirmDialog/index.js';

// In the JSX:
{confirmAction && (
  <ConfirmDialog
    title={`Confirm ${confirmAction.action === 'approve' ? 'Approve' : 'Reject'}`}
    message="This is a critical risk approval. Are you sure?"
    confirmLabel={confirmAction.action === 'approve' ? 'Approve' : 'Reject'}
    confirmColor={confirmAction.action === 'approve' ? 'bg-green-600 active:bg-green-700' : 'bg-red-600 active:bg-red-700'}
    onConfirm={() => handleAction(confirmAction.id, confirmAction.action)}
    onCancel={() => setConfirmAction(null)}
  />
)}
```

Similarly in `ApprovalDetail.tsx`, replace the inline dialog (lines 177-207) with the shared component.

**Verification:** `pnpm build --filter @ditloop/mobile` succeeds. No duplicate dialog code.

---

## Fix 7 — MEDIUM: Add `AbortController` to `useApiFetch`

**Problem:** If `path` changes rapidly (e.g., navigating between views), there's no cancellation of in-flight requests. Stale responses can overwrite newer data.

**File:** `packages/mobile/src/hooks/useApiFetch.ts`

**Action:** Replace the hook with an abort-safe version:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, ApiError } from '../api/client.js';

/** State returned by the useApiFetch hook. */
interface ApiFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook that fetches data from the DitLoop server API with abort support.
 *
 * @param path - API path (e.g. "/workspaces")
 * @returns Object with data, loading, error, and refetch
 */
export function useApiFetch<T>(path: string): ApiFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof ApiError ? err.message : 'Unknown error';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [path]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

**Verification:** No stale data when rapidly switching views. Tests should verify abort behavior.

---

## Fix 8 — MEDIUM: Validate token in `checkHealth`

**Problem:** `checkHealth()` only checks `/api/health` without the Authorization header. A successful health check doesn't confirm the token is valid. User sees "connected" but all subsequent auth'd requests fail.

**File:** `packages/mobile/src/api/client.ts`

**Action:** Replace `checkHealth` (lines 55-63) to also validate the token:

```typescript
/**
 * Check if the server is reachable and the token is valid.
 * Makes an unauthenticated health check AND an authenticated request.
 *
 * @returns True if server is reachable and token is accepted
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const { serverUrl, token } = useConnectionStore.getState();

    // Check server is reachable
    const healthRes = await fetch(`${serverUrl}/api/health`);
    if (!healthRes.ok) return false;

    // Validate token with an authenticated endpoint
    const authRes = await fetch(`${serverUrl}/api/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return authRes.ok;
  } catch {
    return false;
  }
}
```

**Verification:** Entering an invalid token now shows "error" status, not "connected".

---

## Fix 9 — MEDIUM: Add workspace filter to execution list

**Problem:** Task 049 requires "Filter by workspace and status." Status filtering is implemented (tabs), but workspace filtering is missing.

**File:** `packages/mobile/src/views/Executions/ExecutionList.tsx`

**Action:** Add a workspace selector dropdown above the status tabs.

After the `<h1>` and before the filter tabs div, add:

```tsx
{/* Workspace filter */}
{workspaces.length > 0 && (
  <select
    value={workspaceFilter}
    onChange={(e) => setWorkspaceFilter(e.target.value)}
    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
  >
    <option value="">All workspaces</option>
    {workspaces.map((ws) => (
      <option key={ws} value={ws}>{ws}</option>
    ))}
  </select>
)}
```

Add state:
```typescript
const [workspaceFilter, setWorkspaceFilter] = useState('');
```

Derive workspaces from executions:
```typescript
const workspaces = [...new Set(executions.map((e) => e.workspace).filter(Boolean))] as string[];
```

Apply workspace filter alongside status filter:
```typescript
let filtered = FILTER_STATUSES[activeTab]
  ? executions.filter((e) => FILTER_STATUSES[activeTab]!.includes(e.status))
  : executions;

if (workspaceFilter) {
  filtered = filtered.filter((e) => e.workspace === workspaceFilter);
}
```

**Verification:** `pnpm build --filter @ditloop/mobile` succeeds. Workspace dropdown appears when executions have workspace data.

---

## Fix 10 — MEDIUM: Add notification preferences view in mobile

**Problem:** Task 052 requires "Mobile settings screen reads/writes via API." There is no Settings view in the mobile package. Preferences are only enforced server-side.

**Action:** Create a minimal settings view:

**File:** `packages/mobile/src/views/Settings/Settings.tsx`

Implement a simple settings page that:
1. Fetches `GET /api/notifications/preferences`
2. Shows toggles for: enabled (global), each event type, quiet hours (enabled + start/end)
3. On change, `PUT /api/notifications/preferences` with the updated prefs
4. Shows loading/error states

The view should use `apiFetch` for API calls and be accessible from the app's navigation (add a gear icon or "Settings" link in the header or bottom nav).

Create barrel file `packages/mobile/src/views/Settings/index.ts`.

Add route to `packages/mobile/src/App.tsx`:
```tsx
<Route path="/settings" element={<Settings />} />
```

Add navigation link (e.g., in the `AppShell` header as a gear icon, or add a 5th tab to `BottomNav`).

**Verification:** `pnpm build --filter @ditloop/mobile` succeeds. Settings page renders and can toggle preferences.

---

## Fix 11 — MEDIUM: WebSocket event names don't match server

**Problem:** The mobile `ApprovalList` subscribes to events `approval:new`, `approval:approved`, and `approval:denied`, but the server EventBus emits `approval:requested`, `approval:granted`, and `approval:denied`. Only `approval:denied` matches.

**File:** `packages/mobile/src/views/Approvals/ApprovalList.tsx`

**Action:** Fix event names to match the server's `DitLoopEventMap` (in `packages/core/src/events/events.ts`):

Replace lines 88-96:
```typescript
// Before
if (message.event === 'approval:new') {
  const approval = message.data as Approval;
  setApprovals((prev) => [approval, ...prev]);
} else if (
  message.event === 'approval:approved' ||
  message.event === 'approval:denied'
) {
  const { id } = message.data as { id: string };
  setApprovals((prev) => prev.filter((a) => a.id !== id));
}

// After
if (message.event === 'approval:requested') {
  const approval = message.data as Approval;
  setApprovals((prev) => [approval, ...prev]);
} else if (
  message.event === 'approval:granted' ||
  message.event === 'approval:denied'
) {
  const { id } = message.data as { id: string };
  setApprovals((prev) => prev.filter((a) => a.id !== id));
}
```

**Verification:** Real-time approval updates work correctly when connected to the server.

---

## Execution Order

1. **Fix 1** first (adds test infra — needed for verification of other fixes)
2. **Fix 4** + **Fix 5** + **Fix 6** (extract duplicates — independent of each other)
3. **Fix 11** (fix event names — quick, important for correctness)
4. **Fix 7** (AbortController in useApiFetch)
5. **Fix 8** (validate token in checkHealth)
6. **Fix 2** (sessionStorage for token)
7. **Fix 3** (document WebSocket token tradeoff)
8. **Fix 9** (workspace filter)
9. **Fix 10** (settings view)

## Final Verification

```bash
pnpm test          # All packages pass (including new mobile tests)
pnpm build         # Clean build for all packages
```
