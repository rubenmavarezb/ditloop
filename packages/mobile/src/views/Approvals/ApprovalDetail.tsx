import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { DiffViewer } from '../../components/DiffViewer/index.js';
import { ConfirmDialog } from '../../components/ConfirmDialog/index.js';
import { type Approval, RISK_COLORS } from './approval.types.js';

/**
 * Detail view for a single approval showing full description, diff, and action buttons.
 * Includes confirmation dialog for critical risk items.
 */
export function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to use approval passed via navigation state; otherwise fetch
  const passedApproval = (location.state as { approval?: Approval } | null)?.approval;
  const [approval, setApproval] = useState<Approval | null>(passedApproval ?? null);
  const [loading, setLoading] = useState(!passedApproval);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'deny' | null>(null);

  useEffect(() => {
    if (passedApproval) return;

    (async () => {
      try {
        const data = await apiFetch<Approval>(`/approvals/${id}`);
        setApproval(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load approval');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, passedApproval]);

  /**
   * Execute approve or deny action.
   *
   * @param action - Action to perform
   */
  const handleAction = useCallback(
    async (action: 'approve' | 'deny') => {
      if (!approval) return;

      // Require confirmation for critical risk
      if (approval.riskLevel === 'critical' && !confirmAction) {
        setConfirmAction(action);
        return;
      }

      setConfirmAction(null);
      setProcessing(true);

      try {
        const endpoint = action === 'approve' ? 'approve' : 'deny';
        await apiFetch(`/approvals/${approval.id}/${endpoint}`, { method: 'POST' });
        navigate('/approvals', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to ${action}`);
        setProcessing(false);
      }
    },
    [approval, confirmAction, navigate],
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-4">
        <p className="text-red-400 text-sm">{error ?? 'Approval not found'}</p>
        <button
          onClick={() => navigate('/approvals')}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white active:bg-slate-700"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/approvals')}
        className="text-xs text-slate-500 active:text-slate-300"
      >
        &larr; Back to approvals
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="flex-1 text-base font-semibold text-white leading-snug">
            {approval.description}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${RISK_COLORS[approval.riskLevel]}`}
          >
            {approval.riskLevel}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{new Date(approval.timestamp).toLocaleString()}</span>
          {approval.workspace && (
            <>
              <span className="text-slate-700">|</span>
              <span>{approval.workspace}</span>
            </>
          )}
        </div>
      </div>

      {/* Diff viewer */}
      {approval.diff && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Changes
          </h3>
          <DiffViewer diff={approval.diff} />
        </div>
      )}

      {/* Action buttons */}
      {approval.status === 'pending' && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleAction('approve')}
            disabled={processing}
            className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white active:bg-green-700 disabled:opacity-50"
          >
            {processing ? '...' : 'Approve'}
          </button>
          <button
            onClick={() => handleAction('deny')}
            disabled={processing}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700 disabled:opacity-50"
          >
            {processing ? '...' : 'Reject'}
          </button>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={`Confirm ${confirmAction === 'approve' ? 'Approve' : 'Reject'}`}
          message="This is a critical risk approval. Are you sure?"
          confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject'}
          confirmColor={confirmAction === 'approve' ? 'bg-green-600 active:bg-green-700' : 'bg-red-600 active:bg-red-700'}
          onConfirm={() => handleAction(confirmAction)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
