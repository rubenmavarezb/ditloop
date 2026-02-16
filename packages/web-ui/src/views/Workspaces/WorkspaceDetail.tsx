import { useParams, useNavigate } from 'react-router-dom';
import { useApiFetch } from '../../hooks/useApiFetch.js';

/** Workspace detail returned by the API. */
interface WorkspaceDetailData {
  id: string;
  name: string;
  path: string;
  active: boolean;
  lastActivity?: string;
  gitBranch?: string;
  gitStatus?: string;
  projects?: { name: string; path: string }[];
}

/** AIDF context associated with a workspace. */
interface AidfContext {
  tasks?: { name: string; status: string }[];
  roles?: string[];
  plans?: string[];
}

/**
 * Section header component for grouping workspace detail content.
 *
 * @param props - Section title
 */
function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </h3>
  );
}

/**
 * Workspace detail view showing full workspace info, git state, and AIDF context.
 * Navigated to from the workspace list via `/workspace/:id`.
 */
export function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workspace, loading, error, refetch } = useApiFetch<WorkspaceDetailData>(
    `/workspaces/${id}`,
  );
  const { data: aidf } = useApiFetch<AidfContext>(`/workspaces/${id}/aidf`);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-5 w-1/3 rounded bg-slate-700" />
        <div className="h-4 w-2/3 rounded bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-700" />
        <div className="mt-6 h-4 w-1/4 rounded bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 py-12 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={refetch}
          className="min-h-[44px] rounded-lg border border-slate-700 px-4 py-2 text-sm text-white active:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="space-y-6 p-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex min-h-[44px] items-center gap-1 text-sm text-slate-400 active:text-white"
      >
        <span>&larr;</span>
        <span>Back</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              workspace.active ? 'bg-green-400' : 'bg-slate-500'
            }`}
          />
          <h2 className="text-lg font-bold text-white">{workspace.name}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">{workspace.path}</p>
      </div>

      {/* Git info */}
      {(workspace.gitBranch || workspace.gitStatus) && (
        <div>
          <SectionTitle>Git</SectionTitle>
          <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
            {workspace.gitBranch && (
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Branch: </span>
                <span className="font-mono">{workspace.gitBranch}</span>
              </p>
            )}
            {workspace.gitStatus && (
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Status: </span>
                {workspace.gitStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Last activity */}
      {workspace.lastActivity && (
        <div>
          <SectionTitle>Last Activity</SectionTitle>
          <p className="text-sm text-slate-300">
            {new Date(workspace.lastActivity).toLocaleString()}
          </p>
        </div>
      )}

      {/* Projects */}
      {workspace.projects && workspace.projects.length > 0 && (
        <div>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-1">
            {workspace.projects.map((proj) => (
              <div
                key={proj.path}
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2"
              >
                <p className="text-sm font-medium text-white">{proj.name}</p>
                <p className="text-xs text-slate-500">{proj.path}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AIDF section */}
      {aidf && (
        <div>
          <SectionTitle>AIDF</SectionTitle>
          <div className="space-y-3">
            {/* Tasks */}
            {aidf.tasks && aidf.tasks.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-400">Tasks</p>
                <div className="space-y-1">
                  {aidf.tasks.map((task) => (
                    <div
                      key={task.name}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2"
                    >
                      <span className="text-sm text-white">{task.name}</span>
                      <span
                        className={`text-xs ${
                          task.status === 'done'
                            ? 'text-green-400'
                            : task.status === 'in-progress'
                              ? 'text-yellow-400'
                              : 'text-slate-500'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roles */}
            {aidf.roles && aidf.roles.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-400">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {aidf.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Plans */}
            {aidf.plans && aidf.plans.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-400">Plans</p>
                <div className="flex flex-wrap gap-1">
                  {aidf.plans.map((plan) => (
                    <span
                      key={plan}
                      className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {plan}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
