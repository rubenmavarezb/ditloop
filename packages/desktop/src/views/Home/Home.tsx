import { useNavigate } from 'react-router-dom';
import { useWorkspaces, type ResolvedWorkspace } from '../../hooks/useWorkspaces.js';
import { useProfiles } from '../../hooks/useProfiles.js';

/** Home view showing workspace list and current profile. */
export function Home() {
  const navigate = useNavigate();
  const { workspaces, configExists, loading, error } = useWorkspaces();
  const { currentProfileName, currentEmail } = useProfiles();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">Loading configuration...</p>
      </div>
    );
  }

  if (!configExists) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="text-4xl">⚙️</div>
        <h2 className="text-lg font-semibold text-white">No Configuration Found</h2>
        <p className="max-w-md text-center text-sm text-slate-400">
          Run <code className="rounded bg-slate-800 px-1.5 py-0.5 text-ditloop-400">ditloop init</code> in
          your terminal to set up DitLoop.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-red-400">Error loading config: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Workspaces</h1>
          {currentProfileName && (
            <p className="mt-1 text-xs text-slate-500">
              Profile: <span className="text-ditloop-400">{currentProfileName}</span>
              {currentEmail && <span className="ml-1 text-slate-600">({currentEmail})</span>}
            </p>
          )}
        </div>
        <span className="text-xs text-slate-600">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Workspace grid */}
      {workspaces.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <p className="text-sm text-slate-400">No workspaces configured.</p>
          <p className="text-xs text-slate-600">
            Add workspaces to <code className="text-slate-400">~/.ditloop/config.yml</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws: ResolvedWorkspace) => (
            <button
              key={ws.id}
              onClick={() => navigate(`/workspace/${ws.id}`)}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-4 text-left transition-colors hover:border-slate-700 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{ws.name}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
                  {ws.type}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{ws.path}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-600">profile: {ws.profile}</span>
                {ws.aidf && (
                  <span className="rounded bg-ditloop-950 px-1 py-0.5 text-[10px] text-ditloop-400">
                    .ai/
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
