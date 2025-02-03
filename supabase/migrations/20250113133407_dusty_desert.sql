-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create updated function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- For both pending and approved bookings
  IF NEW.status IN ('pending', 'approved') THEN
    -- Case 1: Created/updated >48h before start AND within 24h of start
    IF (NEW.start_time AT TIME ZONE 'UTC' - NEW.updated_at AT TIME ZONE 'UTC' > INTERVAL '48 hours') AND
       (NEW.start_time AT TIME ZONE 'UTC' - CURRENT_TIMESTAMP AT TIME ZONE 'UTC' <= INTERVAL '24 hours') THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
    
    -- Case 2: Created/updated ≤48h before start AND start time has arrived
    ELSIF (NEW.start_time AT TIME ZONE 'UTC' - NEW.updated_at AT TIME ZONE 'UTC' <= INTERVAL '48 hours') AND
          CURRENT_TIMESTAMP AT TIME ZONE 'UTC' >= NEW.start_time AT TIME ZONE 'UTC' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
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

-- Create function to immediately check and cancel bookings
CREATE OR REPLACE FUNCTION cancel_overdue_bookings()
RETURNS void AS $$
BEGIN
  -- Cancel both pending and approved bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
  WHERE 
    status IN ('pending', 'approved')
    AND (
      -- Case 1: Created/updated >48h before start AND within 24h of start
      (start_time AT TIME ZONE 'UTC' - updated_at AT TIME ZONE 'UTC' > INTERVAL '48 hours'
       AND start_time AT TIME ZONE 'UTC' - CURRENT_TIMESTAMP AT TIME ZONE 'UTC' <= INTERVAL '24 hours')
      OR
      -- Case 2: Created/updated ≤48h before start AND start time has arrived
      (start_time AT TIME ZONE 'UTC' - updated_at AT TIME ZONE 'UTC' <= INTERVAL '48 hours'
       AND CURRENT_TIMESTAMP AT TIME ZONE 'UTC' >= start_time AT TIME ZONE 'UTC')
    );
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();