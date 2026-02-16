import type { NotificationType } from './push-notification-service.js';

/** Quiet hours configuration. */
interface QuietHoursConfig {
  enabled: boolean;
  start: string;
  end: string;
}

/** Notification preferences structure matching the config schema. */
export interface NotificationPreferences {
  enabled: boolean;
  quietHours: QuietHoursConfig;
  events: Record<string, boolean>;
  workspaceOverrides: Record<string, {
    enabled?: boolean;
    events?: Record<string, boolean>;
  }>;
}

/**
 * Evaluate whether a notification should be sent based on user preferences.
 *
 * @param preferences - User's notification preferences
 * @param notificationType - The type of notification to evaluate
 * @param workspaceId - Optional workspace context for per-workspace overrides
 * @returns true if the notification should be sent
 */
export function shouldSendNotification(
  preferences: NotificationPreferences,
  notificationType: NotificationType,
  workspaceId?: string,
): boolean {
  // Global kill switch
  if (!preferences.enabled) {
    return false;
  }

  // Quiet hours check
  if (isInQuietHours(preferences.quietHours)) {
    return false;
  }

  // Per-workspace override
  if (workspaceId) {
    const override = preferences.workspaceOverrides?.[workspaceId];
    if (override) {
      if (override.enabled === false) {
        return false;
      }
      if (override.events?.[notificationType] === false) {
        return false;
      }
      if (override.events?.[notificationType] === true) {
        return true;
      }
    }
  }

  // Global event toggle
  return preferences.events?.[notificationType] !== false;
}

/**
 * Check if the current time falls within quiet hours.
 *
 * @param quietHours - Quiet hours configuration
 * @returns true if currently in quiet hours
 */
function isInQuietHours(quietHours: QuietHoursConfig): boolean {
  if (!quietHours.enabled) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(quietHours.start);
  const endMinutes = parseTimeToMinutes(quietHours.end);

  // Handle overnight quiet hours (e.g. 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  // Same-day quiet hours (e.g. 12:00 - 14:00)
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Parse a "HH:MM" time string to minutes since midnight.
 *
 * @param time - Time string in HH:MM format
 * @returns Minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
