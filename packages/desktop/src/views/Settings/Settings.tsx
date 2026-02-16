import { useProfiles } from '../../hooks/useProfiles.js';
import { useConfig } from '../../hooks/useConfig.js';
import type { ProfileConfig } from '../../hooks/useConfig.js';

/** Desktop settings view with profile management and app info. */
export function Settings() {
  const { config, configPath } = useConfig();
  const { profiles, currentProfileName, currentEmail, loading } = useProfiles();

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <h1 className="mb-6 text-xl font-bold text-white">Settings</h1>

      <div className="space-y-6">
        {/* Profiles Section */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Git Profiles</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(profiles).map(([name, profile]: [string, ProfileConfig]) => {
                const isActive = name === currentProfileName;
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between rounded border px-3 py-2 ${
                      isActive
                        ? 'border-ditloop-700/50 bg-ditloop-950/20'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div>
                      <span className="text-sm text-white">{name}</span>
                      <p className="text-xs text-slate-500">
                        {profile.name} &lt;{profile.email}&gt;
                      </p>
                      {profile.sshHost && (
                        <p className="text-[10px] text-slate-600">SSH: {profile.sshHost}</p>
                      )}
                    </div>
                    {isActive && (
                      <span className="rounded bg-ditloop-900 px-2 py-0.5 text-[10px] text-ditloop-400">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
              {Object.keys(profiles).length === 0 && (
                <p className="text-xs text-slate-500">No profiles configured.</p>
              )}
            </div>
          )}
        </section>

        {/* Config Section */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Configuration</h2>
          <div className="space-y-1 text-xs">
            <div className="flex gap-2">
              <span className="text-slate-400">Config file:</span>
              <span className="font-mono text-slate-300">{configPath}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400">Workspaces:</span>
              <span className="text-slate-300">{config?.workspaces.length ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400">Profiles:</span>
              <span className="text-slate-300">{Object.keys(config?.profiles ?? {}).length}</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">About</h2>
          <div className="space-y-1 text-xs">
            <div className="flex gap-2">
              <span className="text-slate-400">Version:</span>
              <span className="text-slate-300">0.1.0</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400">Architecture:</span>
              <span className="text-slate-300">Local-first (Tauri + React)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
