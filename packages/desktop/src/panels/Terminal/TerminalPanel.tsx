/**
 * Terminal panel — bottom center panel.
 * Split into left (terminal) and right (AI Task status).
 * Full xterm.js integration will come in Task 073.
 */
export function TerminalPanel() {
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
        <button
          className="flex items-center gap-2 px-4 text-xs font-medium h-full"
          style={{
            color: 'var(--dl-text-primary)',
            borderBottom: '2px solid var(--dl-accent-secondary, #bd00ff)',
            background: 'var(--dl-bg-panel-hover)',
          }}
        >
          Terminal
        </button>
        <button
          className="flex items-center gap-2 px-4 text-xs font-medium h-full"
          style={{ color: 'var(--dl-text-muted)' }}
        >
          Problems
        </button>
        <div className="ml-auto flex items-center gap-1 pr-3">
          <button className="p-1 rounded" style={{ color: 'var(--dl-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="p-1 rounded" style={{ color: 'var(--dl-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal + AI Task split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Terminal */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            background: 'var(--dl-bg-terminal, #08080a)',
            borderRight: '1px solid var(--dl-border-subtle)',
          }}
        >
          <div className="p-3 font-mono text-xs selectable" style={{ color: 'var(--dl-text-secondary)' }}>
            <div style={{ color: 'var(--dl-color-success)' }}>$ pnpm test</div>
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
            <div className="mt-2">
              Test Suites: 3 passed, 3 total
            </div>
            <div className="mt-2" style={{ color: 'var(--dl-text-muted)' }}>
              <span style={{ color: 'var(--dl-color-success)' }}>$</span> █
            </div>
          </div>
        </div>

        {/* Right: AI Task Status */}
        <div
          className="flex flex-col"
          style={{
            width: 'min(40%, 508px)',
            flexShrink: 0,
            background: 'var(--dl-bg-surface, #0f0f13)',
          }}
        >
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
          </div>
        </div>
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
    </div>
  );
}
