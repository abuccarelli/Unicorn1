-- First update any existing bookings that violate our rules
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE 
  -- Cancel pending bookings
  (status = 'pending' AND (
    -- Created >48h ago and within 24h of start
    (CURRENT_TIMESTAMP - created_at > INTERVAL '48 hours' 
     AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
    OR
    -- Created ≤48h ago and start time passed
    (CURRENT_TIMESTAMP - created_at <= INTERVAL '48 hours'
     AND CURRENT_TIMESTAMP >= start_time)
  ))
  OR
  -- Cancel confirmed bookings
  (status = 'confirmed' AND (
    -- Approved >48h before start and within 24h of start
    (start_time - updated_at > INTERVAL '48 hours'
     AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
    OR
    -- Approved ≤48h before start and start time passed
    (start_time - updated_at <= INTERVAL '48 hours'
     AND CURRENT_TIMESTAMP >= start_time)
  ));