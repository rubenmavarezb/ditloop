import { useWorkspaceTabsStore, type WorkspaceTab } from '../../store/workspace-tabs.js';

/**
 * Workspace tab bar — displays open workspace tabs below the title bar.
 * Each tab shows a status dot, project name, and branch.
 * Active tab has a cyan-to-purple gradient underline.
 */
export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useWorkspaceTabsStore();

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex shrink-0 items-center"
      style={{
        height: 44,
        background: 'var(--dl-bg-panel-hover, rgba(255, 255, 255, 0.03))',
        borderBottom: '1px solid var(--dl-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Tab list */}
      <div className="flex flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            active={tab.id === activeTabId}
            onActivate={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </div>

      {/* New tab button */}
      <button
        className="flex items-center justify-center shrink-0 px-3 h-full"
        style={{ color: 'var(--dl-text-muted)' }}
        onClick={() => {
          // This will be wired to a workspace picker
          openTab({
            id: `new-${Date.now()}`,
            name: 'New Workspace',
            path: '',
            profile: '',
            statusColor: 'var(--dl-text-muted)',
          });
        }}
        title="Open workspace"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

/** Single workspace tab. */
function Tab({
  tab,
  active,
  onActivate,
  onClose,
}: {
  tab: WorkspaceTab;
  active: boolean;
  onActivate: () => void;
  onClose: () => void;
}) {
  return (
    <button
      className="group relative flex items-center gap-2 px-4 text-sm shrink-0 h-full"
      style={{
        background: active ? 'var(--dl-bg-panel-hover)' : 'transparent',
        borderRight: '1px solid var(--dl-border-subtle)',
        minWidth: 120,
        maxWidth: 200,
      }}
      onClick={onActivate}
    >
      {/* Active indicator — gradient bottom border */}
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: 'var(--dl-accent-gradient, linear-gradient(135deg, #00d9ff, #bd00ff))',
            boxShadow: '0 0 8px rgba(0, 217, 255, 0.5)',
          }}
        />
      )}

      {/* Status dot */}
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{
          background: tab.statusColor || 'var(--dl-color-success)',
        }}
      />

      {/* Tab content */}
      <div className="flex flex-col items-start min-w-0">
        <span
          className="text-xs font-medium truncate w-full"
          style={{
            color: active ? 'var(--dl-text-primary)' : 'var(--dl-text-muted)',
            textShadow: active ? 'var(--dl-glow-primary)' : undefined,
          }}
        >
          {tab.name}
        </span>
        {tab.branch && (
          <span
            className="text-xs truncate w-full"
            style={{ color: 'var(--dl-text-muted)', fontSize: 10 }}
          >
            {tab.branch}
          </span>
        )}
      </div>

      {/* Close button */}
      <div
        className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
        style={{ width: 16, height: 16 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-muted)' }}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </button>
  );
}
