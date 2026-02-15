import { describe, it, expect, vi } from 'vitest';
import { formatRelativeTime } from './RelativeTime.js';

describe('formatRelativeTime', () => {
  it('returns "now" for very recent dates', () => {
    expect(formatRelativeTime(new Date())).toBe('now');
  });

  it('returns minutes for dates within the last hour', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m');
  });

  it('returns hours for dates within the last day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h');
  });

  it('returns days for dates within the last week', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d');
  });

  it('returns weeks for older dates', () => {
    const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeWeeksAgo)).toBe('3w');
  });
});
