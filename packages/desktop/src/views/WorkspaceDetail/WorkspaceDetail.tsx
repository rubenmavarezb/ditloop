import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';
import { useGitStatus, useGitLog } from '../../hooks/useLocalGit.js';

/** Workspace detail view showing git status, recent commits, and AIDF info. */
export function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspaces } = useWorkspaces();
  const workspace = workspaces.find((ws) => ws.id === id);

  const { data: gitStatus, loading: gitLoading, refresh } = useGitStatus(workspace?.path);
  const { data: gitLog, loading: logLoading } = useGitLog(workspace?.path, 10);

  if (!workspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Workspace not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 text-sm text-ditloop-400 hover:text-ditloop-300"
          >
            Back to workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-1 text-xs text-slate-500 hover:text-slate-300"
          >
            ← Workspaces
          </button>
          <h1 className="text-xl font-bold text-white">{workspace.name}</h1>
          <p className="text-xs text-slate-500">{workspace.path}</p>
        </div>
        <div className="flex gap-2">
          {workspace.aidf && (
            <span className="rounded bg-ditloop-950 px-2 py-1 text-xs text-ditloop-400">
              AIDF Enabled
            </span>
          )}
          <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
            {workspace.profile}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Git Status Panel */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Git Status</h2>
            <button
              onClick={refresh}
              className="text-xs text-slate-500 hover:text-white"
              disabled={gitLoading}
            >
              {gitLoading ? '...' : 'Refresh'}
            </button>
          </div>

          {gitStatus ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Branch:</span>
                <span className="font-mono text-ditloop-400">{gitStatus.branch}</span>
                {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
                  <span className="text-slate-500">
                    {gitStatus.ahead > 0 && `↑${gitStatus.ahead}`}
                    {gitStatus.behind > 0 && `↓${gitStatus.behind}`}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">{gitStatus.staged.length} staged</span>
                <span className="text-yellow-400">{gitStatus.unstaged.length} modified</span>
                <span className="text-slate-400">{gitStatus.untracked.length} untracked</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {gitLoading ? 'Loading...' : 'Not a git repository'}
            </p>
          )}
        </div>

        {/* Recent Commits Panel */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Recent Commits</h2>
          {logLoading ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : gitLog.length === 0 ? (
            <p className="text-xs text-slate-500">No commits yet</p>
          ) : (
            <div className="space-y-2">
              {gitLog.slice(0, 5).map((commit) => (
                <div key={commit.hash} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ditloop-400">{commit.short_hash}</span>
                    <span className="truncate text-slate-300">{commit.message}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-600">
                    <span>{commit.author}</span>
                    <span>{commit.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
