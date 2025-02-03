import { DateTime } from 'luxon';

export function getUtcOffset(timezone: string): string {
  const now = DateTime.now().setZone(timezone);
  const offset = now.offset / 60; // Convert minutes to hours
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offset));
  return `UTC ${sign}${hours}`;
}

export function getTimezoneFromLocation(): string {
  // Get user's local timezone
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTimezoneDisplay(timezone: string): string {
  const now = DateTime.now().setZone(timezone);
  const offset = now.toFormat('ZZ');
  return `${timezone} (UTC${offset})`;
}