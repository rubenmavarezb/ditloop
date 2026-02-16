import { describe, it, expect, vi, afterEach } from 'vitest';
import { shouldSendNotification, type NotificationPreferences } from './preferences.js';

function defaultPreferences(overrides: Partial<NotificationPreferences> = {}): NotificationPreferences {
  return {
    enabled: true,
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    events: {
      'approval-requested': true,
      'execution-completed': true,
      'execution-failed': true,
      'session-message': true,
    },
    workspaceOverrides: {},
    ...overrides,
  };
}

describe('shouldSendNotification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows notifications when all preferences are defaults', () => {
    const prefs = defaultPreferences();
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(true);
    expect(shouldSendNotification(prefs, 'execution-completed')).toBe(true);
    expect(shouldSendNotification(prefs, 'execution-failed')).toBe(true);
    expect(shouldSendNotification(prefs, 'session-message')).toBe(true);
  });

  it('blocks all notifications when globally disabled', () => {
    const prefs = defaultPreferences({ enabled: false });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(false);
    expect(shouldSendNotification(prefs, 'session-message')).toBe(false);
  });

  it('blocks specific event types when toggled off', () => {
    const prefs = defaultPreferences({
      events: {
        'approval-requested': true,
        'execution-completed': false,
        'execution-failed': true,
        'session-message': false,
      },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(true);
    expect(shouldSendNotification(prefs, 'execution-completed')).toBe(false);
    expect(shouldSendNotification(prefs, 'session-message')).toBe(false);
  });

  it('blocks notifications during quiet hours (overnight)', () => {
    // Mock time to 23:30
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T23:30:00'));

    const prefs = defaultPreferences({
      quietHours: { enabled: true, start: '22:00', end: '08:00' },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(false);
  });

  it('allows notifications outside quiet hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00'));

    const prefs = defaultPreferences({
      quietHours: { enabled: true, start: '22:00', end: '08:00' },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(true);
  });

  it('blocks during quiet hours early morning (overnight wrap)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T06:00:00'));

    const prefs = defaultPreferences({
      quietHours: { enabled: true, start: '22:00', end: '08:00' },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(false);
  });

  it('handles same-day quiet hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T13:00:00'));

    const prefs = defaultPreferences({
      quietHours: { enabled: true, start: '12:00', end: '14:00' },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(false);
  });

  it('ignores quiet hours when disabled', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T23:30:00'));

    const prefs = defaultPreferences({
      quietHours: { enabled: false, start: '22:00', end: '08:00' },
    });
    expect(shouldSendNotification(prefs, 'approval-requested')).toBe(true);
  });

  describe('workspace overrides', () => {
    it('blocks notifications for disabled workspace', () => {
      const prefs = defaultPreferences({
        workspaceOverrides: {
          'my-project': { enabled: false },
        },
      });
      expect(shouldSendNotification(prefs, 'approval-requested', 'my-project')).toBe(false);
      // Other workspaces unaffected
      expect(shouldSendNotification(prefs, 'approval-requested', 'other-project')).toBe(true);
    });

    it('blocks specific events per workspace', () => {
      const prefs = defaultPreferences({
        workspaceOverrides: {
          'noisy-project': {
            events: { 'execution-completed': false },
          },
        },
      });
      expect(shouldSendNotification(prefs, 'execution-completed', 'noisy-project')).toBe(false);
      expect(shouldSendNotification(prefs, 'approval-requested', 'noisy-project')).toBe(true);
    });

    it('workspace override can enable event disabled globally', () => {
      const prefs = defaultPreferences({
        events: {
          'approval-requested': true,
          'execution-completed': false,
          'execution-failed': true,
          'session-message': true,
        },
        workspaceOverrides: {
          'important-project': {
            events: { 'execution-completed': true },
          },
        },
      });
      // Globally off, but workspace override turns it on
      expect(shouldSendNotification(prefs, 'execution-completed', 'important-project')).toBe(true);
      // Without workspace context, still off
      expect(shouldSendNotification(prefs, 'execution-completed')).toBe(false);
    });

    it('falls through to global events when no workspace override for event', () => {
      const prefs = defaultPreferences({
        workspaceOverrides: {
          'some-project': { enabled: true },
        },
      });
      expect(shouldSendNotification(prefs, 'approval-requested', 'some-project')).toBe(true);
    });
  });
});
