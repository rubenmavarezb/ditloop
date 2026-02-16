import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav.js';
import { useConnectionStore } from '@ditloop/web-ui';

/** Status dot colors by connection status. */
const STATUS_COLORS = {
  connected: 'bg-green-400',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-slate-500',
  error: 'bg-red-400',
} as const;

/** App shell with header and bottom navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  const status = useConnectionStore((s) => s.status);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-white">DitLoop</h1>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
          <span className="text-xs text-slate-500 capitalize">{status}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
