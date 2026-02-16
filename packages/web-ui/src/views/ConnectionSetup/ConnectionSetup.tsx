import { useState, type FormEvent } from 'react';
import { useConnection } from '../../hooks/useConnection.js';

/** Connection setup screen shown when no server is configured. */
export function ConnectionSetup() {
  const { connect, status, error } = useConnection();
  const [url, setUrl] = useState('http://localhost:4321');
  const [token, setToken] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !token.trim()) return;
    connect(url.trim(), token.trim());
  };

  const isConnecting = status === 'connecting';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ditloop-700">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DitLoop</h1>
          <p className="mt-1 text-sm text-slate-400">Connect to your development server</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="server-url" className="mb-1 block text-sm font-medium text-slate-300">
              Server URL
            </label>
            <input
              id="server-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:4321"
              required
              disabled={isConnecting}
              className="tap-target w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-ditloop-500 focus:outline-none focus:ring-1 focus:ring-ditloop-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="token" className="mb-1 block text-sm font-medium text-slate-300">
              Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste server token"
              required
              disabled={isConnecting}
              className="tap-target w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 focus:border-ditloop-500 focus:outline-none focus:ring-1 focus:ring-ditloop-500 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              Find it at ~/.ditloop/server-token
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting || !url.trim() || !token.trim()}
            className="tap-target w-full rounded-lg bg-ditloop-600 px-4 py-3 font-medium text-white transition-colors hover:bg-ditloop-500 active:bg-ditloop-700 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </form>

        {/* Help */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Start the server with <code className="text-slate-400">ditloop serve</code>
        </p>
      </div>
    </div>
  );
}
