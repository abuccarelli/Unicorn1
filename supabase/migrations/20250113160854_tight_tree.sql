-- Drop existing functions and trigger if they exist
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'approved' AND NEW.status != 'paid' THEN
    -- Cancel if not paid 24 hours before start
    IF NEW.start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours' THEN
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

  -- Cancel approved (but unpaid) bookings if within 24h of start
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'approved'
    AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();