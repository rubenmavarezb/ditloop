import { useState } from 'react';
import { useConnectionStore } from '@ditloop/web-ui';
import { useAutoConnect } from '../../hooks/useAutoConnect.js';

/** Desktop-enhanced connection setup with auto-detect and local mode. */
export function DesktopConnectionSetup() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const configure = useConnectionStore((s) => s.configure);
  const { detectedServer, scanning, scan, connectToDetected } = useAutoConnect();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && token) {
      configure(url, token);
    }
  };

  const handleAutoConnect = () => {
    if (detectedServer && token) {
      connectToDetected(token);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">DitLoop Desktop</h1>
          <p className="mt-2 text-sm text-slate-400">
            Connect to a DitLoop server to get started
          </p>
        </div>

        {/* Auto-detect banner */}
        {detectedServer && (
          <div className="rounded-lg border border-ditloop-700/50 bg-ditloop-950/30 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm text-white">
                Local server detected at {detectedServer.url}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="API token"
                className="flex-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ditloop-500"
              />
              <button
                onClick={handleAutoConnect}
                disabled={!token}
                className="rounded bg-ditloop-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-ditloop-500 disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {!detectedServer && !scanning && (
          <button
            onClick={scan}
            className="w-full rounded border border-slate-700 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-white"
          >
            Scan for local server
          </button>
        )}

        {scanning && (
          <div className="text-center text-sm text-slate-400">
            Scanning for local servers...
          </div>
        )}

        {/* Manual connection form */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950 px-3 text-xs text-slate-500">
              or connect manually
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Server URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:4321"
              className="w-full rounded bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ditloop-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              API Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your API token"
              className="w-full rounded bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ditloop-500"
            />
          </div>
          <button
            type="submit"
            disabled={!url || !token}
            className="w-full rounded bg-ditloop-600 py-2 text-sm font-medium text-white hover:bg-ditloop-500 disabled:opacity-50"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
