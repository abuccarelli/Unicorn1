-- Drop existing function and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();

-- Create updated function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
DECLARE
  server_time TIMESTAMPTZ;
BEGIN
  -- Get current server time
  SELECT get_server_timestamp() INTO server_time;

  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if created >48h ago and within 24h of start
    IF (server_time - NEW.created_at) > INTERVAL '48 hours' AND
       (NEW.start_time - server_time) <= INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := server_time;
    END IF;
  
  -- Handle confirmed (but unpaid) bookings
  ELSIF NEW.status = 'confirmed' AND NEW.status != 'paid' THEN
    -- Cancel if approved >48h before start and within 24h of start
    IF (NEW.start_time - NEW.updated_at) > INTERVAL '48 hours' AND
       (NEW.start_time - server_time) <= INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := server_time;
    
    -- Cancel if approved ≤48h before start and past start time
    ELSIF (NEW.start_time - NEW.updated_at) <= INTERVAL '48 hours' AND
          server_time >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := server_time;
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

-- Update the cancel_overdue_bookings function
CREATE OR REPLACE FUNCTION cancel_overdue_bookings()
RETURNS void AS $$
DECLARE
  server_time TIMESTAMPTZ;
BEGIN
  -- Get current server time
  SELECT get_server_timestamp() INTO server_time;

  -- Cancel pending bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = server_time
  WHERE 
    status = 'pending'
    AND (
      -- Created >48h ago and within 24h of start
      server_time - created_at > INTERVAL '48 hours' 
      AND start_time - server_time <= INTERVAL '24 hours'
    );

  -- Cancel confirmed (unpaid) bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = server_time
  WHERE 
    status = 'confirmed'
    AND (
      -- Approved >48h before start and within 24h of start
      (start_time - updated_at > INTERVAL '48 hours' 
       AND start_time - server_time <= INTERVAL '24 hours')
      OR
      -- Approved ≤48h before start and past start time
      (start_time - updated_at <= INTERVAL '48 hours' 
       AND server_time >= start_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();