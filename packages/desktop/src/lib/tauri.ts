/**
 * Returns true when running inside a Tauri webview (native app).
 * Returns false in plain browser (vite dev without Tauri).
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Safe invoke wrapper. Returns undefined when not running inside Tauri.
 * Use this instead of importing invoke directly from @tauri-apps/api/core.
 */
export async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T | undefined> {
  if (!isTauri()) return undefined;
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
}
