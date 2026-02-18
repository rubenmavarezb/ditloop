import { useWorkspaces } from '../../hooks/useWorkspaces.js';

/**
 * Left sidebar panel — Workspace Navigator.
 * Shows workspace tabs (Starred/All) and project cards with git status.
 */
export function WorkspaceNavPanel() {
  const { workspaces, loading } = useWorkspaces();

  return (
    <div className="flex h-full flex-col">
      {/* Tabs: Starred / All */}
      <div
        className="flex shrink-0"
        style={{
          height: 43,
          background: 'var(--dl-bg-panel-hover, rgba(255, 255, 255, 0.03))',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <button
          className="flex-1 flex items-center justify-center text-xs font-medium"
          style={{
            color: 'var(--dl-accent-primary)',
            borderBottom: '2px solid var(--dl-accent-primary)',
          }}
        >
          Starred
        </button>
        <button
          className="flex-1 flex items-center justify-center text-xs font-medium"
          style={{ color: 'var(--dl-text-muted)' }}
        >
          All Projects
        </button>
      </div>

      {/* Project Cards */}
      <div className="flex-1 overflow-y-auto p-3" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <span style={{ color: 'var(--dl-text-muted)', fontSize: 12 }}>Loading workspaces...</span>
          </div>
        )}
        {workspaces.map((ws, i) => (
          <WorkspaceCard key={ws.id} workspace={ws} active={i === 0} />
        ))}
        {!loading && workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span style={{ color: 'var(--dl-text-muted)', fontSize: 13 }}>No workspaces configured</span>
            <span style={{ color: 'var(--dl-text-muted)', fontSize: 11 }}>Add workspaces in ~/.ditloop/config.yml</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** A workspace card in the sidebar. */
function WorkspaceCard({ workspace, active }: { workspace: { id: string; name: string; path: string; profile: string }; active: boolean }) {
  return (
    <div
      className="flex flex-col gap-2 p-3"
      style={{
        borderRadius: 'var(--dl-radius-card, 12px)',
        background: active ? 'transparent' : 'var(--dl-bg-panel-hover)',
        border: active
          ? '1px solid var(--dl-accent-primary)'
          : '1px solid var(--dl-border-subtle)',
        boxShadow: active ? 'var(--dl-glow-primary)' : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: active ? 'var(--dl-color-success)' : 'var(--dl-text-muted)',
          }}
        />
        <span className="text-sm font-medium" style={{ color: 'var(--dl-text-primary)' }}>
          {workspace.name}
        </span>
      </div>
      <span
        className="text-xs truncate"
        style={{ color: 'var(--dl-text-muted)', fontFamily: 'var(--dl-font-mono)', fontSize: 11 }}
      >
        {workspace.path}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--dl-bg-panel-hover)',
            color: 'var(--dl-text-secondary)',
            fontSize: 10,
          }}
        >
          {workspace.profile}
        </span>
      </div>
    </div>
  );
}
