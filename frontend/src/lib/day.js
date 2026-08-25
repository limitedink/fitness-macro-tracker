/** Client-side day keys. The browser is the authority on what day it is here. */

export function toDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(dayKey, days) {
  const [year, month, day] = dayKey.split('-').map(Number);
  return toDayKey(new Date(year, month - 1, day + days));
}

export function isToday(dayKey) {
  return dayKey === toDayKey();
}

export function isFuture(dayKey) {
  return dayKey > toDayKey();
}

/** "Today", "Yesterday", or e.g. "Mon, 3 Mar". */
export function formatDayLabel(dayKey) {
  if (isToday(dayKey)) return 'Today';
  if (dayKey === shiftDay(toDayKey(), -1)) return 'Yesterday';

  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const sameYear = date.getFullYear() === new Date().getFullYear();

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
