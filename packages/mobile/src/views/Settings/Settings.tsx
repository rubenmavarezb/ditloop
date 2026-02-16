import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../api/client.js';
import { useConnectionStore } from '../../store/connection.js';

/** Notification preferences from the server. */
interface NotificationPreferences {
  enabled: boolean;
  events: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

/**
 * Settings view for managing notification preferences and connection.
 * Fetches and updates preferences via the server API.
 */
export function Settings() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const serverUrl = useConnectionStore((s) => s.serverUrl);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<NotificationPreferences>('/notifications/preferences');
      setPrefs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const updatePrefs = useCallback(async (updated: NotificationPreferences) => {
    setPrefs(updated);
    setSaving(true);
    try {
      await apiFetch('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    if (!prefs) return;
    updatePrefs({ ...prefs, enabled: !prefs.enabled });
  }, [prefs, updatePrefs]);

  const toggleEvent = useCallback((event: string) => {
    if (!prefs) return;
    updatePrefs({
      ...prefs,
      events: { ...prefs.events, [event]: !prefs.events[event] },
    });
  }, [prefs, updatePrefs]);

  const toggleQuietHours = useCallback(() => {
    if (!prefs) return;
    updatePrefs({
      ...prefs,
      quietHours: { ...prefs.quietHours, enabled: !prefs.quietHours.enabled },
    });
  }, [prefs, updatePrefs]);

  const updateQuietHour = useCallback((field: 'start' | 'end', value: string) => {
    if (!prefs) return;
    updatePrefs({
      ...prefs,
      quietHours: { ...prefs.quietHours, [field]: value },
    });
  }, [prefs, updatePrefs]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-slate-500 animate-pulse">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <h1 className="text-lg font-semibold text-white">Settings</h1>

      {error && (
        <div className="rounded-lg bg-red-950/50 px-3 py-2 text-xs text-red-300">{error}</div>
      )}

      {/* Connection info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-300">Connection</h2>
        <p className="mb-3 text-xs text-slate-500 break-all">{serverUrl}</p>
        <button
          onClick={disconnect}
          className="rounded-lg bg-red-900/40 px-4 py-2 text-xs font-medium text-red-300 active:bg-red-900/70"
        >
          Disconnect
        </button>
      </div>

      {/* Notifications */}
      {prefs && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Notifications</h2>

          {/* Global toggle */}
          <ToggleRow
            label="Enable notifications"
            checked={prefs.enabled}
            onChange={toggleEnabled}
          />

          {prefs.enabled && (
            <>
              {/* Event toggles */}
              <div className="mt-4 border-t border-slate-800 pt-4">
                <h3 className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Events</h3>
                {Object.entries(prefs.events).map(([event, enabled]) => (
                  <ToggleRow
                    key={event}
                    label={event.replace(/[.:]/g, ' ')}
                    checked={enabled}
                    onChange={() => toggleEvent(event)}
                  />
                ))}
              </div>

              {/* Quiet hours */}
              <div className="mt-4 border-t border-slate-800 pt-4">
                <h3 className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Quiet Hours</h3>
                <ToggleRow
                  label="Enable quiet hours"
                  checked={prefs.quietHours.enabled}
                  onChange={toggleQuietHours}
                />
                {prefs.quietHours.enabled && (
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500">From</label>
                      <input
                        type="time"
                        value={prefs.quietHours.start}
                        onChange={(e) => updateQuietHour('start', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500">To</label>
                      <input
                        type="time"
                        value={prefs.quietHours.end}
                        onChange={(e) => updateQuietHour('end', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {saving && (
            <p className="mt-3 text-xs text-slate-500 animate-pulse">Saving...</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Props for ToggleRow. */
interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

/** A labeled toggle switch row. */
function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between py-2"
    >
      <span className="text-sm text-white">{label}</span>
      <div
        className={`h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-ditloop-500' : 'bg-slate-700'
        }`}
      >
        <div
          className={`h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
