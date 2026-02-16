import { useConnectionStore } from '@ditloop/web-ui';

/** Status dot colors by connection status. */
const STATUS_COLORS = {
  connected: 'bg-green-400',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-slate-500',
  error: 'bg-red-400',
} as const;

/** Custom title bar with drag region, connection status, and window controls. */
export function TitleBar() {
  const status = useConnectionStore((s) => s.status);

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
      className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-3"
    >
      {/* Left: app title + status */}
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <span className="text-sm font-bold text-white" data-tauri-drag-region>
          DitLoop
        </span>
        <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
        <span className="text-xs text-slate-500 capitalize">{status}</span>
      </div>

      {/* Right: window controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={minimize}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Minimize"
        >
          <span className="text-xs">&#x2014;</span>
        </button>
        <button
          onClick={toggleMaximize}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Maximize"
        >
          <span className="text-xs">&#x25A1;</span>
        </button>
        <button
          onClick={close}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-600 hover:text-white"
          aria-label="Close"
        >
          <span className="text-xs">&#x2715;</span>
        </button>
      </div>
    </header>
  );
}
