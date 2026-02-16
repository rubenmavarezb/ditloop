import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { useConnectionStore } from '../../store/connection.js';
import type { Execution, ExecutionStatus } from '../../components/ExecutionCard/index.js';

/** Map execution status to dot styling classes. */
const STATUS_DOT_CLASSES: Record<ExecutionStatus, string> = {
  running: 'bg-blue-400 animate-pulse',
  queued: 'bg-yellow-400',
  success: 'bg-green-400',
  failed: 'bg-red-400',
  cancelled: 'bg-slate-500',
};

/** Map execution status to human-readable label. */
const STATUS_LABELS: Record<ExecutionStatus, string> = {
  running: 'Running',
  queued: 'Queued',
  success: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/**
 * Format elapsed time as a human-readable string.
 *
 * @param seconds - Total elapsed seconds
 * @returns Formatted elapsed time
 */
function formatElapsedSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainSec}s`;

  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m`;
}

/**
 * Compute elapsed seconds from start time to end time or now.
 *
 * @param startedAt - ISO date string when execution started
 * @param completedAt - ISO date string when execution completed
 * @returns Elapsed seconds, or 0 if no start time
 */
function computeElapsed(startedAt?: string, completedAt?: string): number {
  if (!startedAt) return 0;
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return 0;
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
}

/**
 * Detail view for a single execution. Shows status, output stream, and cancel controls.
 * Connects to the SSE stream for live output and auto-scrolls.
 */
export function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serverUrl, token } = useConnectionStore();

  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const outputRef = useRef<HTMLPreElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch execution detail
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    apiFetch<Execution>(`/executions/${id}`)
      .then((data) => {
        setExecution(data);
        setElapsed(computeElapsed(data.startedAt, data.completedAt));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load execution');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Elapsed time counter for running executions
  useEffect(() => {
    if (!execution || execution.status !== 'running' || !execution.startedAt) return;

    const interval = setInterval(() => {
      setElapsed(computeElapsed(execution.startedAt, execution.completedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [execution]);

  // SSE output stream
  useEffect(() => {
    if (!id || !serverUrl || !token) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const streamOutput = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/executions/${id}/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setOutput((prev) => prev + chunk);
        }
      } catch {
        // AbortError is expected on cleanup; ignore other stream errors
      }
    };

    streamOutput();

    return () => {
      controller.abort();
      abortRef.current = null;
    };
  }, [id, serverUrl, token]);

  // Auto-scroll output area
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCancel = useCallback(async () => {
    if (!id || cancelling) return;
    setCancelling(true);
    try {
      await apiFetch(`/executions/${id}/cancel`, { method: 'POST' });
      setExecution((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch {
      // Ignore cancel errors
    } finally {
      setCancelling(false);
    }
  }, [id, cancelling]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-slate-500">Loading execution...</span>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-4">
        <span className="text-sm text-red-400">{error ?? 'Execution not found'}</span>
        <button
          onClick={() => navigate('/executions')}
          className="rounded-md bg-slate-800 px-4 py-2 text-xs text-white active:bg-slate-700"
        >
          Back to list
        </button>
      </div>
    );
  }

  const isRunning = execution.status === 'running';
  const label = execution.command ?? execution.prompt ?? 'Unknown task';

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/executions')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate-400 active:text-white"
          aria-label="Back"
        >
          <span className="text-lg font-mono">&lt;</span>
        </button>
        <h1 className="flex-1 truncate text-lg font-semibold text-white">Execution</h1>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <div
          className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT_CLASSES[execution.status]}`}
        />
        <span className="text-sm font-medium text-white">{STATUS_LABELS[execution.status]}</span>
        {elapsed > 0 && (
          <span className="ml-auto text-xs text-slate-500 font-mono">
            {formatElapsedSeconds(elapsed)}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <div>
          <span className="text-xs text-slate-500">Command</span>
          <p className="text-sm text-white font-mono break-all">{label}</p>
        </div>
        {execution.workspace && (
          <div>
            <span className="text-xs text-slate-500">Workspace</span>
            <p className="text-sm text-white">{execution.workspace}</p>
          </div>
        )}
        {execution.startedAt && (
          <div>
            <span className="text-xs text-slate-500">Started</span>
            <p className="text-sm text-white">{new Date(execution.startedAt).toLocaleString()}</p>
          </div>
        )}
        {execution.exitCode !== undefined && execution.exitCode !== null && (
          <div>
            <span className="text-xs text-slate-500">Exit code</span>
            <p className="text-sm text-white font-mono">{execution.exitCode}</p>
          </div>
        )}
      </div>

      {/* Output stream */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Output</span>
        <pre
          ref={outputRef}
          className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-black p-3 text-xs text-green-400 font-mono whitespace-pre-wrap break-all"
        >
          {output || (isRunning ? 'Waiting for output...' : 'No output')}
        </pre>
      </div>

      {/* Cancel button for running executions */}
      {isRunning && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="min-h-[44px] rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors active:bg-red-700 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Execution'}
        </button>
      )}
    </div>
  );
}
