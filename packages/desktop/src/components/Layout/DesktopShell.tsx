import type { ReactNode } from 'react';
import { TitleBar } from './TitleBar.js';
import { StatusBar } from './StatusBar.js';
import { UpdateBanner } from '../UpdateBanner/UpdateBanner.js';

/** Props for the DesktopShell component. */
interface DesktopShellProps {
  /** Header content (tab bar). */
  header?: ReactNode;
  /** Main IDE layout content. */
  children: ReactNode;
}

/**
 * Desktop application shell — the outermost wrapper.
 * Provides: TitleBar (top) → Header slot → Content → StatusBar (bottom).
 * Background uses theme tokens for the base color.
 */
export function DesktopShell({ header, children }: DesktopShellProps) {
  return (
    <div
      className="flex h-screen flex-col"
      style={{
        background: 'var(--dl-bg-base, #050508)',
        fontFamily: 'var(--dl-font-sans)',
        color: 'var(--dl-text-primary, #d1d5db)',
      }}
    >
      <TitleBar />
      <UpdateBanner />
      {header}
      <div className="flex-1 overflow-hidden">{children}</div>
      <StatusBar />
    </div>
  );
}
