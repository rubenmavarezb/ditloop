/**
 * Source Control panel — right sidebar.
 * Shows branch info, commit input, staged/unstaged changes.
 * Full git integration will come in Task 075.
 */
export function SourceControlPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 44,
          background: 'var(--dl-bg-panel-hover)',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: 'var(--dl-text-primary)', letterSpacing: '0.6px' }}
          >
            SOURCE CONTROL
          </span>
          <span
            className="flex items-center justify-center text-xs rounded-full px-1.5"
            style={{
              height: 18,
              minWidth: 20,
              background: 'rgba(0, 184, 212, 0.2)',
              color: 'var(--dl-accent-primary)',
              border: '1px solid rgba(0, 184, 212, 0.3)',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            5
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded" style={{ color: 'var(--dl-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button className="p-1 rounded" style={{ color: 'var(--dl-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Branch Info */}
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            background: 'var(--dl-bg-panel-hover)',
            border: '1px solid var(--dl-border-subtle)',
            borderRadius: 'var(--dl-radius-button)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-accent-primary)' }}>
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: 'var(--dl-text-primary)' }}>
              feat/v08-ide
            </span>
            <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
              ↑ 3 ↓ 0 from origin
            </span>
          </div>
        </div>

        {/* Commit Message Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            placeholder="Commit message..."
            className="w-full resize-none rounded-lg p-3 text-xs outline-none selectable"
            style={{
              background: 'var(--dl-bg-input)',
              border: '1px solid var(--dl-border-default)',
              borderRadius: 'var(--dl-radius-button)',
              color: 'var(--dl-text-primary)',
              fontFamily: 'var(--dl-font-sans)',
              minHeight: 60,
            }}
            rows={3}
          />
          <button
            className="w-full rounded-lg py-2 text-xs font-medium"
            style={{
              background: 'var(--dl-accent-primary)',
              color: 'var(--dl-text-inverse)',
              borderRadius: 'var(--dl-radius-button)',
            }}
          >
            Commit
          </button>
        </div>

        {/* Staged Changes */}
        <FileSection title="Staged Changes" count={2}>
          <FileEntry name="layout-engine.tsx" status="A" />
          <FileEntry name="theme-provider.tsx" status="A" />
        </FileSection>

        {/* Unstaged Changes */}
        <FileSection title="Changes" count={3}>
          <FileEntry name="App.tsx" status="M" />
          <FileEntry name="DesktopShell.tsx" status="M" />
          <FileEntry name="index.css" status="M" />
        </FileSection>
      </div>
    </div>
  );
}

/** Section header for file groups (Staged, Changes, Untracked). */
function FileSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--dl-text-secondary)' }}>
          {title}
        </span>
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </div>
    </div>
  );
}

/** Single file entry in a section. */
function FileEntry({ name, status }: { name: string; status: 'M' | 'A' | 'D' | '?' }) {
  const statusColors: Record<string, string> = {
    M: 'var(--dl-color-warning)',
    A: 'var(--dl-color-success)',
    D: 'var(--dl-color-error)',
    '?': 'var(--dl-text-muted)',
  };

  return (
    <div
      className="flex items-center justify-between rounded px-2 py-1 text-xs"
      style={{ borderRadius: 'var(--dl-radius-small)' }}
    >
      <span style={{ color: 'var(--dl-text-secondary)', fontFamily: 'var(--dl-font-mono)', fontSize: 11 }}>
        {name}
      </span>
      <span className="font-bold" style={{ color: statusColors[status], fontSize: 10 }}>
        {status}
      </span>
    </div>
  );
}
