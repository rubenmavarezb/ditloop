import { useState, useRef, useCallback } from 'react';
import { useApiFetch } from '../../hooks/useApiFetch.js';
import { WorkspaceCard } from '../../components/WorkspaceCard/index.js';

/** Workspace summary returned by the API. */
interface Workspace {
  id: string;
  name: string;
  path: string;
  active: boolean;
  lastActivity?: string;
}

/** Number of skeleton cards to show during loading. */
const SKELETON_COUNT = 5;

/** Minimum pull distance in pixels to trigger a refresh. */
const PULL_THRESHOLD = 80;

/**
 * Skeleton placeholder card shown while workspaces are loading.
 */
function SkeletonCard() {
  return (
    <div className="flex min-h-[44px] animate-pulse items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
      <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-slate-700" />
        <div className="h-2.5 w-1/2 rounded bg-slate-700" />
      </div>
    </div>
  );
}

/**
 * Workspace list view with search, pull-to-refresh, and loading/empty/error states.
 * This is the main landing view of the mobile app.
 */
export function WorkspaceList() {
  const { data, loading, error, refetch } = useApiFetch<Workspace[]>('/workspaces');
  const [search, setSearch] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filtered = data?.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0) {
      setPulling(true);
      setPullDistance(Math.min(diff, PULL_THRESHOLD * 1.5));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD) {
      refetch();
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, refetch]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pulling && (
        <div
          className="flex items-center justify-center text-xs text-slate-500 transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          {pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search workspaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-500"
        />

        {/* Loading state */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={refetch}
              className="min-h-[44px] rounded-lg border border-slate-700 px-4 py-2 text-sm text-white active:bg-slate-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            No workspaces found
          </div>
        )}

        {/* Workspace list */}
        {!loading && !error && filtered && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                id={ws.id}
                name={ws.name}
                path={ws.path}
                active={ws.active}
                lastActivity={ws.lastActivity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
