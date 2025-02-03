import { DateTime } from 'luxon';

export function convertTimeToTeacherTimezone(
  date: string,
  time: string,
  teacherTimezone: string | null
): string | null {
  if (!teacherTimezone) return null;

  const localDateTime = DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm');
  const teacherDateTime = localDateTime.setZone(teacherTimezone);
  
  return teacherDateTime.toFormat('HH:mm');
}

export function getTimezoneDisplay(timezone: string | null): string {
  if (!timezone) return '';
  
  const now = DateTime.now().setZone(timezone);
  const offset = now.toFormat('ZZ');
  return `${timezone} (UTC${offset})`;
}