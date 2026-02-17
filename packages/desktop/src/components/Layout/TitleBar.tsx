/**
 * Custom title bar matching the SuperDesign mockup.
 * Layout: [Logo & Breadcrumbs] — [Command Palette Search] — [Controls]
 * Height: 56px, backdrop blur, bottom border.
 */
export function TitleBar() {
  const minimize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  };

  const toggleMaximize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().toggleMaximize();
  };

  const close = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
  };

  return (
    <header
      data-tauri-drag-region
      className="flex shrink-0 items-center justify-between px-4"
      style={{
        height: 56,
        background: 'var(--dl-bg-header, rgba(10, 10, 15, 0.4))',
        backdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        WebkitBackdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        borderBottom: '1px solid var(--dl-border-subtle, rgba(255, 255, 255, 0.05))',
      }}
    >
      {/* Left: Logo & Breadcrumbs */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            background: 'var(--dl-accent-gradient, linear-gradient(135deg, #00d9ff, #9d00d4))',
          }}
        >
          <span className="text-sm font-bold" style={{ color: 'var(--dl-text-inverse, #050508)' }}>
            DL
          </span>
        </div>

        <div className="flex flex-col gap-0.5" data-tauri-drag-region>
          <span
            style={{
              color: 'var(--dl-text-muted, #6b7280)',
              fontFamily: 'var(--dl-font-mono)',
              fontSize: 12,
              letterSpacing: '0.6px',
              fontWeight: 400,
            }}
          >
            WORKSPACE
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-medium"
              style={{
                color: 'var(--dl-accent-primary, #00d9ff)',
                textShadow: 'var(--dl-glow-primary, 0 0 8px rgba(0, 217, 255, 0.6))',
              }}
            >
              ditloop
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Button */}
      <button
        className="flex items-center gap-3 px-4"
        style={{
          height: 48,
          maxWidth: 672,
          flex: '0 1 672px',
          borderRadius: 'var(--dl-radius-pill, 9999px)',
          background: 'var(--dl-bg-panel-hover, rgba(255, 255, 255, 0.05))',
          border: '1px solid var(--dl-border-strong, rgba(255, 255, 255, 0.1))',
        }}
        onClick={() => window.dispatchEvent(new CustomEvent('ditloop:toggle-palette'))}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-muted)' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-sm" style={{ color: 'var(--dl-text-muted, #6b7280)' }}>
          Search files, commands, workspaces...
        </span>
        <div className="ml-auto">
          <kbd
            className="flex items-center justify-center px-1.5 text-xs"
            style={{
              height: 26,
              borderRadius: 'var(--dl-radius-small, 4px)',
              background: 'var(--dl-border-strong, rgba(255, 255, 255, 0.1))',
              border: '1px solid var(--dl-border-subtle)',
              color: 'var(--dl-text-muted)',
              fontFamily: 'var(--dl-font-mono)',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </button>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="flex items-center justify-center rounded-full" style={{ width: 32, height: 40 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-secondary)' }}>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        {/* New AI Task button (gradient) */}
        <button
          className="flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: 'var(--dl-accent-gradient)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-inverse)' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Window controls */}
        <div className="ml-2 flex items-center gap-1.5">
          <button onClick={minimize} className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" aria-label="Minimize" />
          <button onClick={toggleMaximize} className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" aria-label="Maximize" />
          <button onClick={close} className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" aria-label="Close" />
        </div>
      </div>
    </header>
  );
}
