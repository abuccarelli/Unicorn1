-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Only cancel if start time has passed
    IF CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'approved' AND NEW.status != 'paid' THEN
    -- Cancel if either:
    -- 1. More than 24h since approval OR
    -- 2. Start time has arrived
    IF (CURRENT_TIMESTAMP - NEW.updated_at >= INTERVAL '24 hours') OR
       CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
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
  -- Cancel pending bookings if start time has passed
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'pending'
    AND CURRENT_TIMESTAMP >= start_time;

  -- Cancel approved (but unpaid) bookings if:
  -- 1. More than 24h since approval OR
  -- 2. Start time has arrived
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'approved'
    AND (
      CURRENT_TIMESTAMP - updated_at >= INTERVAL '24 hours'
      OR CURRENT_TIMESTAMP >= start_time
    );
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();