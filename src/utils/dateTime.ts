import { DateTime } from 'luxon';

export function formatDate(date: string | Date): string {
  const dt = DateTime.fromISO(date.toString(), { zone: 'UTC' }).toLocal();
  return dt.toFormat('MMMM d, yyyy');
}

export function formatTime(date: string | Date): string {
  const dt = DateTime.fromISO(date.toString(), { zone: 'UTC' }).toLocal();
  return dt.toFormat('h:mm a');
}

export function formatMessageTime(dateStr: string): string {
  const messageTime = DateTime.fromISO(dateStr, { zone: 'UTC' }).toLocal();
  const now = DateTime.local();

  if (!messageTime.isValid) {
    return 'Invalid date';
  }

  if (messageTime.hasSame(now, 'day')) {
    return messageTime.toFormat('h:mm a');
  } else if (messageTime.hasSame(now.minus({ days: 1 }), 'day')) {
    return 'Yesterday ' + messageTime.toFormat('h:mm a');
  } else if (messageTime > now.minus({ days: 7 })) {
    return messageTime.toFormat('cccc h:mm a');
  } else {
    return messageTime.toFormat('LLL d, h:mm a');
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Just now';
  }

  const dt = DateTime.fromISO(date.toString(), { zone: 'UTC' }).toLocal();
  const now = DateTime.local();

  if (!dt.isValid) {
    return 'Just now';
  }

  const diff = now.diff(dt, ['days', 'hours', 'minutes', 'seconds']).toObject();

  if (diff.days && diff.days > 7) {
    return dt.toFormat('LLL d, yyyy');
  } else if (diff.days && diff.days > 1) {
    return `${Math.floor(diff.days)} days ago`;
  } else if (diff.days === 1) {
    return 'Yesterday';
  } else if (diff.hours && diff.hours > 1) {
    return `${Math.floor(diff.hours)} hours ago`;
  } else if (diff.hours === 1) {
    return '1 hour ago';
  } else if (diff.minutes && diff.minutes > 1) {
    return `${Math.floor(diff.minutes)} minutes ago`;
  } else if (diff.minutes === 1) {
    return '1 minute ago';
  } else {
    return 'Just now';
  }
}

export function storeDateTime(date: string, time: string): string {
  // Convert local datetime to UTC for storage
  const local = DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: 'local' });
  if (!local.isValid) {
    throw new Error('Invalid date or time format');
  }
  return local.toUTC().toISO();
}