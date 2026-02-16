import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { ditloopWs } from '../../api/websocket.js';
import { ConfirmDialog } from '../../components/ConfirmDialog/index.js';
import { type Approval, RISK_COLORS } from './approval.types.js';

/** Swipe threshold in pixels to trigger an action. */
const SWIPE_THRESHOLD = 100;

/**
 * Formats a timestamp string into a human-readable relative or absolute string.
 *
 * @param timestamp - ISO timestamp
 * @returns Formatted date string
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Approval list view displaying pending approvals with swipe-to-act and button alternatives.
 * Supports real-time updates via WebSocket and confirmation dialogs for critical risk items.
 */
export function ApprovalList() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'approve' | 'deny';
  } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchApprovals = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<Approval[]>('/approvals');
      setApprovals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Real-time WebSocket updates
  useEffect(() => {
    const unsubscribe = ditloopWs.onMessage((message) => {
      if (!message.event.startsWith('approval:')) return;

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
    });

    return unsubscribe;
  }, []);

  /**
   * Handle approve or deny action for an approval.
   *
   * @param id - Approval ID
   * @param action - Action to perform
   */
  const handleAction = useCallback(
    async (id: string, action: 'approve' | 'deny') => {
      const approval = approvals.find((a) => a.id === id);
      if (!approval) return;

      // Require confirmation for critical risk level
      if (approval.riskLevel === 'critical' && !confirmAction) {
        setConfirmAction({ id, action });
        return;
      }

      setConfirmAction(null);
      setProcessingIds((prev) => new Set(prev).add(id));

      try {
        const endpoint = action === 'approve' ? 'approve' : 'deny';
        await apiFetch(`/approvals/${id}/${endpoint}`, { method: 'POST' });
        setApprovals((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to ${action}`);
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [approvals, confirmAction],
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading approvals...</div>
      </div>
    );
  }

  // Error state
  if (error && approvals.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchApprovals}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white active:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (approvals.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 px-4">
        <span className="text-2xl">✓</span>
        <p className="text-slate-500 text-sm">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-950/50 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {approvals.map((approval) => (
        <ApprovalCard
          key={approval.id}
          approval={approval}
          isProcessing={processingIds.has(approval.id)}
          onApprove={() => handleAction(approval.id, 'approve')}
          onDeny={() => handleAction(approval.id, 'deny')}
          onTap={() => navigate(`/approvals/${approval.id}`, { state: { approval } })}
        />
      ))}

      {/* Confirmation dialog for critical items */}
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
    </div>
  );
}

/** Props for ApprovalCard. */
interface ApprovalCardProps {
  approval: Approval;
  isProcessing: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onTap: () => void;
}

/**
 * Swipeable approval card with visual feedback and action buttons.
 *
 * @param props - Card props
 */
function ApprovalCard({ approval, isProcessing, onApprove, onDeny, onTap }: ApprovalCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only start swiping if horizontal movement dominates
    if (!isSwiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      e.preventDefault();
      setOffsetX(dx);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (offsetX > SWIPE_THRESHOLD) {
      onApprove();
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onDeny();
    }
    setOffsetX(0);
    isSwiping.current = false;
  }, [offsetX, onApprove, onDeny]);

  const bgReveal =
    offsetX > 0
      ? 'bg-green-900/60'
      : offsetX < 0
        ? 'bg-red-900/60'
        : 'bg-transparent';

  return (
    <div className={`relative overflow-hidden rounded-xl ${bgReveal}`}>
      {/* Swipe hint labels */}
      {offsetX > 20 && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-400 font-bold text-sm">
          Approve
        </div>
      )}
      {offsetX < -20 && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-red-400 font-bold text-sm">
          Reject
        </div>
      )}

      {/* Card body */}
      <div
        className="relative rounded-xl border border-slate-800 bg-slate-900 p-4 transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!isSwiping.current) onTap();
        }}
      >
        {/* Header row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="flex-1 text-sm text-white leading-snug">{approval.description}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${RISK_COLORS[approval.riskLevel]}`}
          >
            {approval.riskLevel}
          </span>
        </div>

        {/* Meta row */}
        <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
          <span>{formatTimestamp(approval.timestamp)}</span>
          {approval.workspace && (
            <>
              <span className="text-slate-700">|</span>
              <span className="truncate">{approval.workspace}</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove();
            }}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-green-900/40 py-2 text-xs font-medium text-green-300 active:bg-green-900/70 disabled:opacity-50"
          >
            {isProcessing ? '...' : 'Approve'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeny();
            }}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-red-900/40 py-2 text-xs font-medium text-red-300 active:bg-red-900/70 disabled:opacity-50"
          >
            {isProcessing ? '...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

