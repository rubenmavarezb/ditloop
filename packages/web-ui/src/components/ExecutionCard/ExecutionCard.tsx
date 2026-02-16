import { useNavigate } from 'react-router-dom';

/** Possible statuses of an execution. */
export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

/** Execution summary returned by the API. */
export interface Execution {
  id: string;
  status: ExecutionStatus;
  command?: string;
  prompt?: string;
  workspace?: string;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number;
}

/** Props for the ExecutionCard component. */
interface ExecutionCardProps {
  execution: Execution;
}

/** Map execution status to dot styling classes. */
export const STATUS_DOT_CLASSES: Record<ExecutionStatus, string> = {
  running: 'bg-blue-400 animate-pulse',
  queued: 'bg-yellow-400',
  success: 'bg-green-400',
  failed: 'bg-red-400',
  cancelled: 'bg-slate-500',
};

/** Map execution status to human-readable label. */
export const STATUS_LABELS: Record<ExecutionStatus, string> = {
  running: 'Running',
  queued: 'Queued',
  success: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/**
 * Compute elapsed time as a human-readable string.
 *
 * @param startedAt - ISO date string when execution started
 * @param completedAt - ISO date string when execution completed (if finished)
 * @returns Formatted elapsed time string, or empty string if no start time
 */
function formatElapsed(startedAt?: string, completedAt?: string): string {
  if (!startedAt) return '';

  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return '';

  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainSec}s`;

  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m`;
}

/**
 * Card displaying an execution summary. Taps navigate to the execution detail view.
 *
 * @param props - Execution card properties
 */
export function ExecutionCard({ execution }: ExecutionCardProps) {
  const navigate = useNavigate();
  const { id, status, command, prompt, workspace, startedAt, completedAt } = execution;

  const label = command ?? prompt ?? 'Unknown task';
  const elapsed = formatElapsed(startedAt, completedAt);

  return (
    <button
      onClick={() => navigate(`/executions/${id}`)}
      className="flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left transition-colors active:bg-slate-800"
    >
      {/* Status dot */}
      <div
        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT_CLASSES[status]}`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{label}</p>
        <div className="flex items-center gap-2">
          {workspace && (
            <span className="truncate text-xs text-slate-500">{workspace}</span>
          )}
          <span className="text-xs text-slate-600">{STATUS_LABELS[status]}</span>
        </div>
      </div>

      {/* Elapsed time */}
      {elapsed && (
        <span className="flex-shrink-0 text-xs text-slate-500 font-mono">
          {elapsed}
        </span>
      )}
    </button>
  );
}
