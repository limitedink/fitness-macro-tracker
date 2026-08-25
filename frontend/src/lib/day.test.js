import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDayLabel, isFuture, isToday, shiftDay, toDayKey } from './day';

afterEach(() => vi.useRealTimers());

const freeze = (iso) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
};

describe('toDayKey', () => {
  it('uses local calendar fields, so late evenings stay on the same day', () => {
    expect(toDayKey(new Date(2026, 0, 5, 23, 45))).toBe('2026-01-05');
    expect(toDayKey(new Date(2026, 0, 5, 0, 15))).toBe('2026-01-05');
  });
});

describe('shiftDay', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDay('2024-02-28', 1)).toBe('2024-02-29');
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('day predicates', () => {
  it('identifies today, yesterday and the future', () => {
    freeze('2026-06-10T12:00:00');
    expect(isToday('2026-06-10')).toBe(true);
    expect(isFuture('2026-06-11')).toBe(true);
    expect(isFuture('2026-06-10')).toBe(false);
    expect(formatDayLabel('2026-06-10')).toBe('Today');
    expect(formatDayLabel('2026-06-09')).toBe('Yesterday');
  });

  it('formats older days as a weekday and date', () => {
    freeze('2026-06-10T12:00:00');
    expect(formatDayLabel('2026-06-01')).toMatch(/Jun/);
  });
});
