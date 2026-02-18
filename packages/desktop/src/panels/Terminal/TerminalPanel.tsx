import { useState, useCallback } from 'react';
import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';

/** A terminal tab instance. */
interface TerminalTab {
  id: string;
  name: string;
  workspaceId: string;
}

/**
 * Terminal panel — bottom center panel with terminal tabs and AI task status.
 * Tab management is local; real xterm.js + PTY integration comes when
 * portable-pty is added to the Rust backend.
 */
export function TerminalPanel() {
  const { activeTabId } = useWorkspaceTabsStore();
  const { workspaces } = useWorkspaces();
  const activeWorkspace = workspaces.find((ws) => ws.id === activeTabId);

  const [tabs, setTabs] = useState<TerminalTab[]>(() => {
    if (activeTabId) {
      return [{ id: `term-${activeTabId}-1`, name: 'bash', workspaceId: activeTabId }];
    }
    return [{ id: 'term-default-1', name: 'bash', workspaceId: '' }];
  });
  const [activeTermTab, setActiveTermTab] = useState(tabs[0]?.id ?? '');
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'problems'>('terminal');
  const [splitMode, setSplitMode] = useState(false);

  const addTerminalTab = useCallback(() => {
    const newTab: TerminalTab = {
      id: `term-${Date.now()}`,
      name: `bash ${tabs.length + 1}`,
      workspaceId: activeTabId ?? '',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTermTab(newTab.id);
  }, [tabs.length, activeTabId]);

  const closeTerminalTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (activeTermTab === id && next.length > 0) {
          setActiveTermTab(next[next.length - 1].id);
        }
        return next;
      });
    },
    [activeTermTab],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div
        className="flex shrink-0 items-center"
        style={{
          height: 40,
          background: 'var(--dl-bg-panel-hover, rgba(255, 255, 255, 0.03))',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        {/* Bottom panel tabs */}
        <button
          className="flex items-center gap-2 px-4 text-xs font-medium h-full"
          style={{
            color: activeBottomTab === 'terminal' ? 'var(--dl-text-primary)' : 'var(--dl-text-muted)',
            borderBottom: activeBottomTab === 'terminal' ? '2px solid var(--dl-accent-secondary, #bd00ff)' : '2px solid transparent',
            background: activeBottomTab === 'terminal' ? 'var(--dl-bg-panel-hover)' : 'transparent',
          }}
          onClick={() => setActiveBottomTab('terminal')}
        >
          Terminal
        </button>
        <button
          className="flex items-center gap-2 px-4 text-xs font-medium h-full"
          style={{
            color: activeBottomTab === 'problems' ? 'var(--dl-text-primary)' : 'var(--dl-text-muted)',
            borderBottom: activeBottomTab === 'problems' ? '2px solid var(--dl-accent-secondary, #bd00ff)' : '2px solid transparent',
            background: activeBottomTab === 'problems' ? 'var(--dl-bg-panel-hover)' : 'transparent',
          }}
          onClick={() => setActiveBottomTab('problems')}
        >
          Problems
        </button>

        {/* Separator */}
        <div className="h-4 mx-1" style={{ borderLeft: '1px solid var(--dl-border-subtle)' }} />

        {/* Terminal tabs (only visible when Terminal is active) */}
        {activeBottomTab === 'terminal' && (
          <div className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="group flex items-center gap-1.5 px-3 text-xs h-full"
                style={{
                  color: activeTermTab === tab.id ? 'var(--dl-accent-primary)' : 'var(--dl-text-muted)',
                  background: activeTermTab === tab.id ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
                }}
                onClick={() => setActiveTermTab(tab.id)}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                {tab.name}
                {tabs.length > 1 && (
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    onClick={(e) => { e.stopPropagation(); closeTerminalTab(tab.id); }}
                    style={{ color: 'var(--dl-text-muted)', fontSize: 10 }}
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 pr-3">
          {activeBottomTab === 'terminal' && (
            <>
              <button
                onClick={addTerminalTab}
                className="p-1 rounded"
                style={{ color: 'var(--dl-text-muted)' }}
                title="New terminal"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                onClick={() => setSplitMode(!splitMode)}
                className="p-1 rounded"
                style={{ color: splitMode ? 'var(--dl-accent-primary)' : 'var(--dl-text-muted)' }}
                title="Toggle split view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {activeBottomTab === 'terminal' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Terminal Area */}
          <div
            className={splitMode ? 'flex-1' : 'flex-[2]'}
            style={{
              background: 'var(--dl-bg-terminal, #08080a)',
              borderRight: splitMode ? '1px solid var(--dl-border-subtle)' : undefined,
            }}
          >
            <TerminalView workspacePath={activeWorkspace?.path} />
          </div>

          {/* AI Task Status (visible when not in split mode or as second split) */}
          <div
            className="flex flex-col"
            style={{
              width: splitMode ? '50%' : 'min(40%, 508px)',
              flexShrink: 0,
              background: 'var(--dl-bg-surface, #0f0f13)',
            }}
          >
            <AiTaskStatus />
          </div>
        </div>
      ) : (
        <ProblemsView />
      )}
    </div>
  );
}

/** Terminal view placeholder — will be replaced with xterm.js. */
function TerminalView({ workspacePath }: { workspacePath?: string }) {
  return (
    <div className="p-3 font-mono text-xs selectable h-full" style={{ color: 'var(--dl-text-secondary)' }}>
      <div style={{ color: 'var(--dl-text-muted)', fontSize: 10, marginBottom: 8 }}>
        {workspacePath ? `Terminal: ${workspacePath}` : 'No workspace selected'}
      </div>
      <div style={{ color: 'var(--dl-color-success)' }}>
        $ <span className="font-normal">pnpm test</span>
      </div>
      <div className="mt-2">
        <span style={{ color: 'var(--dl-color-success)' }}>PASS</span>{' '}
        <span>src/config/schema.test.ts</span>
      </div>
      <div>
        <span style={{ color: 'var(--dl-color-success)' }}>PASS</span>{' '}
        <span>src/events/event-bus.test.ts</span>
      </div>
      <div>
        <span style={{ color: 'var(--dl-color-success)' }}>PASS</span>{' '}
        <span>src/workspace/workspace-manager.test.ts</span>
      </div>
      <div className="mt-2">Test Suites: 3 passed, 3 total</div>
      <div className="mt-2" style={{ color: 'var(--dl-text-muted)' }}>
        <span style={{ color: 'var(--dl-color-success)' }}>$</span>{' '}
        <span className="animate-pulse">█</span>
      </div>
      <div className="mt-4 p-2 rounded text-xs" style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.1)' }}>
        <span style={{ color: 'var(--dl-accent-primary)' }}>xterm.js</span>{' '}
        <span style={{ color: 'var(--dl-text-muted)' }}>integration pending — requires portable-pty in Rust backend</span>
      </div>
    </div>
  );
}

/** AI Task execution status widget. */
function AiTaskStatus() {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{
            background: 'rgba(0, 217, 255, 0.15)',
            color: 'var(--dl-accent-primary)',
            borderRadius: 'var(--dl-radius-small)',
          }}
        >
          Task #054
        </span>
        <span className="text-xs" style={{ color: 'var(--dl-text-secondary)' }}>
          Add retry logic
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <TaskStep status="done" label="Analyzing codebase" />
        <TaskStep status="done" label="Planning changes" />
        <TaskStep status="running" label="Applying changes..." />
        <TaskStep status="pending" label="Running tests" />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="text-xs px-3 py-1.5 rounded font-medium"
          style={{
            background: 'var(--dl-accent-primary)',
            color: 'var(--dl-text-inverse)',
            borderRadius: 'var(--dl-radius-small)',
          }}
        >
          Approve
        </button>
        <button
          className="text-xs px-3 py-1.5 rounded font-medium"
          style={{
            background: 'var(--dl-bg-panel-hover)',
            color: 'var(--dl-text-secondary)',
            border: '1px solid var(--dl-border-default)',
            borderRadius: 'var(--dl-radius-small)',
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

/** A step in an AI task execution. */
function TaskStep({ status, label }: { status: 'done' | 'running' | 'pending'; label: string }) {
  const colors = {
    done: 'var(--dl-color-success)',
    running: 'var(--dl-accent-primary)',
    pending: 'var(--dl-text-muted)',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full"
        style={{
          background: colors[status],
          boxShadow: status === 'running' ? `0 0 6px ${colors[status]}` : undefined,
        }}
      />
      <span
        className="text-xs"
        style={{
          color: status === 'pending' ? 'var(--dl-text-muted)' : 'var(--dl-text-secondary)',
          fontWeight: status === 'running' ? 600 : 400,
        }}
      >
        {label}
      </span>
      {status === 'done' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-color-success)' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

/** Problems panel view — shows build errors/warnings. */
function ProblemsView() {
  return (
    <div className="flex-1 p-3" style={{ background: 'var(--dl-bg-terminal, #08080a)' }}>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dl-color-error)' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="text-xs" style={{ color: 'var(--dl-color-error)' }}>0 Errors</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dl-color-warning)' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-xs" style={{ color: 'var(--dl-color-warning)' }}>0 Warnings</span>
        </div>
      </div>
      <div className="flex items-center justify-center py-8">
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>No problems detected</span>
      </div>
    </div>
  );
}
