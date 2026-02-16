import type { ReactNode } from 'react';
import { TitleBar } from './TitleBar.js';
import { Sidebar } from './Sidebar.js';
import { UpdateBanner } from '../UpdateBanner/UpdateBanner.js';

/** Desktop application shell with title bar, sidebar, update banner, and content area. */
export function DesktopShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <TitleBar />
      <UpdateBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
