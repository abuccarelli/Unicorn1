-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
DECLARE
  now_timestamp TIMESTAMPTZ;
BEGIN
  -- Get current server timestamp
  now_timestamp := CURRENT_TIMESTAMP;

  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel immediately if start time has passed
    IF now_timestamp >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := now_timestamp;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'approved' AND NEW.status != 'paid' THEN
    -- Cancel immediately if:
    -- 1. Start time has passed OR
    -- 2. More than 24h since approval
    IF now_timestamp >= NEW.start_time OR
       now_timestamp >= NEW.updated_at + INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := now_timestamp;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status checks
CREATE TRIGGER check_booking_status
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_status();

-- Force update on all pending and approved bookings to trigger the check
UPDATE bookings 
SET updated_at = updated_at 
WHERE status IN ('pending', 'approved');