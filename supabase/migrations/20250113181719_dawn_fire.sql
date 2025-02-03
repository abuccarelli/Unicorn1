-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();

-- Create simple function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if start time has passed, nothing else
  IF NEW.status IN ('pending', 'approved') AND CURRENT_TIMESTAMP > NEW.start_time THEN
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
  AND CURRENT_TIMESTAMP > start_time;