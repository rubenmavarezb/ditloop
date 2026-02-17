/**
 * Enhanced status bar matching the SuperDesign mockup footer.
 * Height: 32px. Shows: branch, sync, errors/warnings, AIDF status, cursor position.
 */
export function StatusBar() {
  return (
    <footer
      className="flex shrink-0 items-center justify-between px-4"
      style={{
        height: 32,
        background: 'var(--dl-bg-header, rgba(10, 10, 15, 0.8))',
        backdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        WebkitBackdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        borderTop: '1px solid var(--dl-border-subtle, rgba(255, 255, 255, 0.05))',
        fontFamily: 'var(--dl-font-sans)',
        fontSize: 11,
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Branch */}
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-secondary)' }}>
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span style={{ color: 'var(--dl-text-secondary)', fontWeight: 500 }}>main*</span>
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-secondary)' }}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span style={{ color: 'var(--dl-text-secondary)' }}>Syncing...</span>
        </div>

        {/* Errors & Warnings (with separator) */}
        <div
          className="flex items-center gap-3 pl-3"
          style={{ borderLeft: '1px solid var(--dl-border-strong, rgba(255, 255, 255, 0.1))' }}
        >
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-color-error, #f87171)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span style={{ color: 'var(--dl-color-error, #f87171)' }}>0</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-color-warning, #facc15)' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ color: 'var(--dl-color-warning, #facc15)' }}>2</span>
          </div>
        </div>

        {/* AIDF Status */}
        <div
          className="flex items-center gap-1.5 pl-3"
          style={{ borderLeft: '1px solid var(--dl-border-strong)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-accent-primary, #00d9ff)' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span
            style={{
              color: 'var(--dl-accent-primary, #00d9ff)',
              fontWeight: 700,
              textShadow: 'var(--dl-glow-primary, 0 0 8px rgba(0, 217, 255, 0.6))',
            }}
          >
            AIDF Active: 2 tasks
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3" style={{ color: 'var(--dl-text-muted, #6b7280)', opacity: 0.6 }}>
        <span>Ln 42, Col 18</span>
        <span>UTF-8</span>
        <span>TypeScript</span>
      </div>
    </footer>
  );
}
