import { useUpdater } from '../../hooks/useUpdater.js';

/** In-app banner displayed when an update is available. */
export function UpdateBanner() {
  const { update, downloadAndInstall } = useUpdater();

  if (!update.available) return null;

  return (
    <div className="flex items-center justify-between border-b border-ditloop-700/30 bg-ditloop-950/50 px-4 py-2">
      <div className="flex items-center gap-2 text-sm">
        {update.downloading ? (
          <span className="text-ditloop-300">
            Downloading update...
          </span>
        ) : (
          <>
            <span className="text-ditloop-300">
              Update available: v{update.version}
            </span>
          </>
        )}
      </div>
      {!update.downloading && (
        <button
          onClick={downloadAndInstall}
          className="rounded bg-ditloop-600 px-3 py-1 text-xs font-medium text-white hover:bg-ditloop-500"
        >
          Restart to Update
        </button>
      )}
    </div>
  );
}
