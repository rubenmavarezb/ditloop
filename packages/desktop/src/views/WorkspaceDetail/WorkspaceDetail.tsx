import { useParams, useNavigate } from 'react-router-dom';
import { safeInvoke } from '../../lib/tauri.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';
import { useGitStatus, useGitLog } from '../../hooks/useLocalGit.js';
import { useAiTools, useLaunchAiCli } from '../../hooks/useLocalAiCli.js';
import { useMultiWindow } from '../../hooks/useMultiWindow.js';

/** Workspace detail view showing git status, recent commits, AIDF info, and actions. */
export function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspaces } = useWorkspaces();
  const workspace = workspaces.find((ws) => ws.id === id);

  const { data: gitStatus, loading: gitLoading, refresh } = useGitStatus(workspace?.path);
  const { data: gitLog, loading: logLoading } = useGitLog(workspace?.path, 10);
  const { tools: aiTools } = useAiTools();
  const { launch, launching } = useLaunchAiCli();
  const { openWorkspaceWindow } = useMultiWindow();

  const availableTools = aiTools.filter((t) => t.available);

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
            &larr; Workspaces
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

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => safeInvoke('open_in_terminal', { path: workspace.path })}
          className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"
        >
          Open in Terminal
        </button>
        <button
          onClick={() => safeInvoke('open_in_editor', { path: workspace.path, editor: null })}
          className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"
        >
          Open in Editor
        </button>
        <button
          onClick={() => openWorkspaceWindow(workspace.path)}
          className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"
        >
          Open in New Window
        </button>
        {availableTools.map((tool) => (
          <button
            key={tool.command}
            onClick={() => launch(tool.command, workspace.path)}
            disabled={launching}
            className="rounded border border-ditloop-700/50 bg-ditloop-950/30 px-3 py-1.5 text-xs text-ditloop-400 hover:border-ditloop-600 hover:text-ditloop-300 disabled:opacity-50"
          >
            Launch {tool.name}
          </button>
        ))}
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
                    {gitStatus.ahead > 0 && `\u2191${gitStatus.ahead}`}
                    {gitStatus.behind > 0 && `\u2193${gitStatus.behind}`}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">{gitStatus.staged.length} staged</span>
                <span className="text-yellow-400">{gitStatus.unstaged.length} modified</span>
                <span className="text-slate-400">{gitStatus.untracked.length} untracked</span>
              </div>
              {gitStatus.staged.length + gitStatus.unstaged.length + gitStatus.untracked.length > 0 && (
                <div className="mt-2 max-h-32 space-y-0.5 overflow-auto">
                  {gitStatus.staged.map((f) => (
                    <div key={`s-${f.path}`} className="flex gap-2 font-mono text-[10px]">
                      <span className="text-green-400">S</span>
                      <span className="text-slate-300">{f.path}</span>
                    </div>
                  ))}
                  {gitStatus.unstaged.map((f) => (
                    <div key={`u-${f.path}`} className="flex gap-2 font-mono text-[10px]">
                      <span className="text-yellow-400">M</span>
                      <span className="text-slate-300">{f.path}</span>
                    </div>
                  ))}
                  {gitStatus.untracked.map((f) => (
                    <div key={`?-${f}`} className="flex gap-2 font-mono text-[10px]">
                      <span className="text-slate-500">?</span>
                      <span className="text-slate-400">{f}</span>
                    </div>
                  ))}
                </div>
              )}
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
              {gitLog.slice(0, 8).map((commit) => (
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

        {/* AIDF Info Panel */}
        {workspace.aidf && (
          <div className="rounded-lg border border-ditloop-800/30 bg-ditloop-950/20 p-4">
            <h2 className="mb-3 text-sm font-semibold text-ditloop-300">AIDF Context</h2>
            <div className="space-y-1 text-xs">
              <p className="text-slate-400">
                This workspace has an <code className="text-ditloop-400">.ai/</code> folder
                with development context for AI tools.
              </p>
              <button
                onClick={() => navigate(`/files?path=${encodeURIComponent(workspace.path + '/.ai')}`)}
                className="mt-2 text-ditloop-400 hover:text-ditloop-300"
              >
                Browse .ai/ folder &rarr;
              </button>
            </div>
          </div>
        )}

        {/* AI Tools Panel */}
        {availableTools.length > 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">AI Tools</h2>
            <div className="space-y-2">
              {availableTools.map((tool) => (
                <div key={tool.command} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-300">{tool.name}</span>
                    {tool.version && (
                      <span className="ml-2 text-[10px] text-slate-600">{tool.version}</span>
                    )}
                  </div>
                  <button
                    onClick={() => launch(tool.command, workspace.path)}
                    disabled={launching}
                    className="rounded bg-slate-800 px-2 py-0.5 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                  >
                    Launch
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
