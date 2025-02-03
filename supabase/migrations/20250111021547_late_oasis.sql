-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create updated function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if created more than 48 hours ago AND still pending 24 hours prior to lesson's start
    IF (CURRENT_TIMESTAMP - NEW.created_at > INTERVAL '48 hours') AND
       (NEW.start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours') THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle approved (but unpaid) bookings
  ELSIF NEW.status = 'confirmed' AND NEW.status != 'paid' THEN
    -- Case 1: Approved more than 48 hours ago and still in approved status 24 hours prior to start
    IF (CURRENT_TIMESTAMP - NEW.updated_at > INTERVAL '48 hours') AND
       (NEW.start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours') THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Case 2: Recently approved (less than 48h ago) and start time has passed
    ELSIF (CURRENT_TIMESTAMP - NEW.updated_at <= INTERVAL '48 hours') AND
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
  -- Cancel pending bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'pending'
    AND (CURRENT_TIMESTAMP - created_at > INTERVAL '48 hours')
    AND (start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours');

  -- Cancel approved (unpaid) bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'confirmed'
    AND (
      -- Case 1: Approved more than 48h ago and still in approved status 24h before start
      ((CURRENT_TIMESTAMP - updated_at > INTERVAL '48 hours')
       AND (start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours'))
      OR
      -- Case 2: Recently approved but start time has passed
      ((CURRENT_TIMESTAMP - updated_at <= INTERVAL '48 hours')
       AND CURRENT_TIMESTAMP >= start_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();