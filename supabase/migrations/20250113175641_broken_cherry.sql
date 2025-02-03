-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();

-- Create improved function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP > NEW.start_time THEN
      RAISE NOTICE 'Cancelling pending booking % because start time % has passed (current time: %)',
        NEW.id, NEW.start_time, CURRENT_TIMESTAMP;
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'approved' AND NEW.status != 'paid' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP > NEW.start_time THEN
      RAISE NOTICE 'Cancelling approved booking % because start time % has passed (current time: %)',
        NEW.id, NEW.start_time, CURRENT_TIMESTAMP;
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    -- Or cancel if more than 24h since approval
    ELSIF CURRENT_TIMESTAMP > NEW.updated_at + INTERVAL '24 hours' THEN
      RAISE NOTICE 'Cancelling approved booking % because more than 24h passed since approval',
        NEW.id;
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs on both INSERT and UPDATE
CREATE TRIGGER check_booking_status
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_status();

-- Force immediate cancellation of overdue bookings
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE status IN ('pending', 'approved')
  AND (
    CURRENT_TIMESTAMP > start_time  -- Past start time
    OR (
      status = 'approved' 
      AND CURRENT_TIMESTAMP > updated_at + INTERVAL '24 hours'  -- Approved more than 24h ago
    )
  );

-- Verify the results
SELECT 
  id,
  status,
  start_time,
  updated_at,
  CURRENT_TIMESTAMP as current_time,
  CURRENT_TIMESTAMP > start_time as is_past_start_time
FROM bookings 
WHERE start_time >= '2025-01-13 18:00:00'
ORDER BY start_time;