-- Show exact timestamps for comparison
SELECT 
  id,
  status,
  start_time AT TIME ZONE 'UTC' as start_time_utc,
  updated_at AT TIME ZONE 'UTC' as updated_at_utc,
  CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as current_time_utc,
  (start_time AT TIME ZONE 'UTC' - CURRENT_TIMESTAMP AT TIME ZONE 'UTC') as time_until_start,
  (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - updated_at AT TIME ZONE 'UTC') as time_since_update
FROM bookings 
WHERE status IN ('pending', 'approved')
ORDER BY start_time;