import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../api/client.js';
import { ditloopWs } from '../../api/websocket.js';
import { ExecutionCard } from '../../components/ExecutionCard/index.js';
import type { Execution, ExecutionStatus } from '../../components/ExecutionCard/index.js';

/** Filter tab options for the execution list. */
type FilterTab = 'all' | 'running' | 'completed' | 'failed';

/** Map filter tab to the statuses it includes. */
const FILTER_STATUSES: Record<FilterTab, ExecutionStatus[] | null> = {
  all: null,
  running: ['running', 'queued'],
  completed: ['success'],
  failed: ['failed', 'cancelled'],
};

/** Available filter tabs with labels. */
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

/**
 * View that lists all executions with filter tabs and real-time updates.
 * Fetches executions from the API and subscribes to WebSocket events for live updates.
 */
export function ExecutionList() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [workspaceFilter, setWorkspaceFilter] = useState('');

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Execution[]>('/executions');
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  // Subscribe to real-time execution events
  useEffect(() => {
    const unsubscribe = ditloopWs.onMessage((message) => {
      if (!message.event.startsWith('execution:')) return;

      const updated = message.data as Execution;
      if (!updated?.id) return;

      setExecutions((prev) => {
        const idx = prev.findIndex((e) => e.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        // New execution — prepend
        return [updated, ...prev];
      });
    });

    return unsubscribe;
  }, []);

  const workspaces = [...new Set(executions.map((e) => e.workspace).filter(Boolean))] as string[];

  let filtered = FILTER_STATUSES[activeTab]
    ? executions.filter((e) => FILTER_STATUSES[activeTab]!.includes(e.status))
    : executions;

  if (workspaceFilter) {
    filtered = filtered.filter((e) => e.workspace === workspaceFilter);
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <h1 className="text-lg font-semibold text-white">Executions</h1>

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

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-900 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 active:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-slate-500">Loading executions...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={fetchExecutions}
            className="rounded-md bg-slate-800 px-4 py-2 text-xs text-white active:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-slate-500">
            {activeTab === 'all' ? 'No executions yet' : `No ${activeTab} executions`}
          </span>
        </div>
      )}

      {/* Execution list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((execution) => (
            <ExecutionCard key={execution.id} execution={execution} />
          ))}
        </div>
      )}
    </div>
  );
}
