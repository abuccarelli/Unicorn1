-- First update any existing bookings that should be cancelled
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE 
  status = 'pending' 
  AND (
    -- Case 1: Created >48h ago and within 24h of start
    (CURRENT_TIMESTAMP - created_at > INTERVAL '48 hours' 
     AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
    OR
    -- Case 2: Created ≤48h ago and start time has passed
    (CURRENT_TIMESTAMP - created_at <= INTERVAL '48 hours'
     AND CURRENT_TIMESTAMP >= start_time)
  );

-- Also update any approved bookings that should be cancelled
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE 
  status = 'approved'
  AND (
    -- Case 1: Approved >48h before start and within 24h of start
    (start_time - updated_at > INTERVAL '48 hours'
     AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
    OR
    -- Case 2: Approved ≤48h before start and start time has passed
    (start_time - updated_at <= INTERVAL '48 hours'
     AND CURRENT_TIMESTAMP >= start_time)
  );

-- Force a refresh of the trigger for all bookings
UPDATE bookings 
SET updated_at = updated_at 
WHERE status IN ('pending', 'approved');