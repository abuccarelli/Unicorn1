-- Drop the get_server_timestamp function as we're using CURRENT_TIMESTAMP directly
DROP FUNCTION IF EXISTS get_server_timestamp();

-- Update check_booking_status function to use CURRENT_TIMESTAMP
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if created less than 48h ago and start time has passed
    IF (CURRENT_TIMESTAMP - NEW.created_at <= INTERVAL '48 hours') AND
       (CURRENT_TIMESTAMP >= NEW.start_time) THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle confirmed (but unpaid) bookings
  ELSIF NEW.status = 'confirmed' AND NEW.status != 'paid' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update cancel_overdue_bookings function to use CURRENT_TIMESTAMP
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
    AND (CURRENT_TIMESTAMP - created_at <= INTERVAL '48 hours')
    AND (CURRENT_TIMESTAMP >= start_time);

  -- Cancel confirmed (unpaid) bookings
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'confirmed'
    AND CURRENT_TIMESTAMP >= start_time;
END;
$$ LANGUAGE plpgsql;