-- Check all pending and approved bookings with their timestamps
SELECT 
  id,
  status,
  start_time,
  updated_at,
  CURRENT_TIMESTAMP as current_time,
  CURRENT_TIMESTAMP >= start_time as start_time_passed,
  CASE 
    WHEN status = 'approved' THEN
      CURRENT_TIMESTAMP >= updated_at + INTERVAL '24 hours'
    ELSE NULL
  END as approval_expired,
  start_time - CURRENT_TIMESTAMP as time_until_start,
  CURRENT_TIMESTAMP - updated_at as time_since_update
FROM bookings
WHERE status IN ('pending', 'approved')
ORDER BY start_time;