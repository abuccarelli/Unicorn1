import { DateTime } from 'luxon';

export function formatDate(date: string | Date): string {
  try {
    const dt = DateTime.fromISO(date.toString());
    if (!dt.isValid) {
      return 'Invalid date';
    }
    return dt.toFormat('MMMM d, yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

export function formatTime(date: string | Date): string {
  try {
    const dt = DateTime.fromISO(date.toString());
    if (!dt.isValid) {
      return 'Invalid time';
    }
    return dt.toFormat('h:mm a');
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid time';
  }
}

export function formatMessageTime(dateStr: string): string {
  try {
    const messageTime = DateTime.fromISO(dateStr);
    const now = DateTime.now();

    if (!messageTime.isValid) {
      return 'Invalid time';
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
  } catch (error) {
    console.error('Message time formatting error:', error);
    return 'Invalid time';
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Invalid date';
  }

  try {
    const dt = DateTime.fromISO(date.toString());
    const now = DateTime.now();

    if (!dt.isValid) {
      return 'Invalid date';
    }

    const diff = now.diff(dt, ['seconds']).toObject();
    const seconds = Math.floor(diff.seconds || 0);

    // If less than 5 seconds ago
    if (seconds < 5) {
      return 'Just now';
    }

    // If less than a minute ago
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }

    // For older times, calculate full diff
    const fullDiff = now.diff(dt, ['months', 'days', 'hours', 'minutes']).toObject();
    
    // Months
    if (fullDiff.months && fullDiff.months >= 1) {
      const months = Math.floor(fullDiff.months);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // Days
    if (fullDiff.days && fullDiff.days >= 1) {
      const days = Math.floor(fullDiff.days);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Hours
    if (fullDiff.hours && fullDiff.hours >= 1) {
      const hours = Math.floor(fullDiff.hours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Minutes
    if (fullDiff.minutes && fullDiff.minutes >= 1) {
      const minutes = Math.floor(fullDiff.minutes);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Fallback to seconds if all else fails
    return `${seconds} seconds ago`;

  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

// Function to convert local date and time to UTC ISO string
export function storeDateTime(date: string, time: string): string {
  try {
    const local = DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { 
      zone: 'local' 
    });
    
    if (!local.isValid) {
      throw new Error('Invalid date or time format');
    }
    
    return local.toUTC().toISO();
  } catch (error) {
    console.error('Date conversion error:', error);
    throw new Error('Invalid date or time format');
  }
}

// Helper to ensure consistent English locale
function setEnglishLocale() {
  if (typeof window !== 'undefined') {
    DateTime.local().setLocale('en');
  }
}

// Call this when the app starts
setEnglishLocale();