/**
 * Days are stored as plain `YYYY-MM-DD` strings rather than timestamp ranges.
 *
 * The client sends the day it is actually living in, so a meal logged at 11pm
 * never lands on the wrong date because the server happens to run in UTC.
 */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDayKey(value) {
  if (typeof value !== 'string' || !DAY_PATTERN.test(value)) return false;
  // Reject impossible dates such as 2026-02-31, which Date would silently roll over.
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/** The server's own current day, used only as a fallback when the client omits one. */
export function todayKey(now = new Date()) {
  return toDayKey(now);
}

export function toDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Shift a day key by whole days. `shiftDay('2026-01-01', -1) === '2025-12-31'`. */
export function shiftDay(dayKey, days) {
  const [year, month, day] = dayKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}
