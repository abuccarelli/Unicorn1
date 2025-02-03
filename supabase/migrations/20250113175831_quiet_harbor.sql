-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();

-- Create improved function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
DECLARE
  time_diff INTERVAL;
BEGIN
  -- Calculate time difference between current time and start time
  time_diff := CURRENT_TIMESTAMP - NEW.start_time;

  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if even 1 second has passed after start time
    IF time_diff > INTERVAL '0 seconds' THEN
      RAISE NOTICE 'Cancelling pending booking % because % has passed since start time',
        NEW.id, time_diff;
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'approved' AND NEW.status != 'paid' THEN
    -- Cancel if even 1 second has passed after start time
    IF time_diff > INTERVAL '0 seconds' THEN
      RAISE NOTICE 'Cancelling approved booking % because % has passed since start time',
        NEW.id, time_diff;
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    -- Or cancel if more than 24h since approval
    ELSIF CURRENT_TIMESTAMP - NEW.updated_at > INTERVAL '24 hours' THEN
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

-- Force immediate cancellation of overdue bookings with strict time comparison
UPDATE bookings 
SET 
  updated_at = CURRENT_TIMESTAMP  -- This will trigger the function
WHERE status IN ('pending', 'approved')
  AND (
    CURRENT_TIMESTAMP - start_time > INTERVAL '0 seconds'  -- Past start time by even 1 second
    OR (
      status = 'approved' 
      AND CURRENT_TIMESTAMP - updated_at > INTERVAL '24 hours'  -- Approved more than 24h ago
    )
  );

-- Verify the results with precise timing
SELECT 
  id,
  status,
  start_time,
  CURRENT_TIMESTAMP as current_time,
  CURRENT_TIMESTAMP - start_time as time_since_start,
  CASE 
    WHEN CURRENT_TIMESTAMP - start_time > INTERVAL '0 seconds'
    THEN 'Yes'
    ELSE 'No'
  END as should_be_cancelled
FROM bookings 
WHERE start_time >= '2025-01-13 18:00:00'
ORDER BY start_time;