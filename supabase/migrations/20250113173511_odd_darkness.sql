-- Check current booking statuses
SELECT 
  id,
  status,
  start_time AT TIME ZONE 'UTC' as start_time_utc,
  updated_at AT TIME ZONE 'UTC' as updated_at_utc,
  CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as current_time_utc
FROM bookings 
ORDER BY start_time;