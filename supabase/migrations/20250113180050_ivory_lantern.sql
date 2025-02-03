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
  -- Extract epoch gives us seconds, allowing for microsecond precision
  IF EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.start_time)) >= 0 THEN
    RAISE NOTICE 'Cancelling booking % because start time % has passed (current time: %)',
      NEW.id, NEW.start_time, CURRENT_TIMESTAMP;
    NEW.status := 'cancelled';
    NEW.updated_at := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs on both INSERT and UPDATE
CREATE TRIGGER check_booking_status
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_status();

-- Force immediate cancellation of all bookings where start time has passed
UPDATE bookings 
SET updated_at = CURRENT_TIMESTAMP
WHERE status IN ('pending', 'approved')
  AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) >= 0;

-- Verify the results with microsecond precision
SELECT 
  id,
  status,
  start_time,
  CURRENT_TIMESTAMP as current_time,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) as seconds_since_start,
  CASE 
    WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) >= 0
    THEN 'Yes'
    ELSE 'No'
  END as should_be_cancelled
FROM bookings 
WHERE start_time >= '2025-01-13 18:00:00'
ORDER BY start_time;