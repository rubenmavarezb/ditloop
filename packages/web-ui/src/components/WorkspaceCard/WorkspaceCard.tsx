import { useNavigate } from 'react-router-dom';

/** Workspace summary for the list view. */
interface WorkspaceCardProps {
  id: string;
  name: string;
  path: string;
  active: boolean;
  lastActivity?: string;
}

/**
 * Format a date string as a relative time (e.g. "3m ago", "2h ago", "5d ago").
 *
 * @param dateStr - ISO date string
 * @returns Human-readable relative time
 */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (Number.isNaN(diffMs) || diffMs < 0) return '';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Card displaying a workspace summary. Taps navigate to the workspace detail view.
 *
 * @param props - Workspace card properties
 */
export function WorkspaceCard({ id, name, path, active, lastActivity }: WorkspaceCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/workspace/${id}`)}
      className="flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left transition-colors active:bg-slate-800"
    >
      {/* Status dot */}
      <div
        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
          active ? 'bg-green-400' : 'bg-slate-500'
        }`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <p className="truncate text-xs text-slate-500">{path}</p>
      </div>

      {/* Last activity */}
      {lastActivity && (
        <span className="flex-shrink-0 text-xs text-slate-500">
          {relativeTime(lastActivity)}
        </span>
      )}
    </button>
  );
}
