/*
  # Add automatic booking cancellation

  1. Changes
    - Add function to automatically cancel bookings based on approval time
    - Add trigger to check cancellation conditions on booking updates
    
  2. Rules
    - If approved >48h before start: Cancel 24h before start
    - If approved ≤48h before start: Cancel at start time
*/

-- Function to handle automatic booking cancellation
CREATE OR REPLACE FUNCTION check_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  time_until_start INTERVAL;
  time_since_approval INTERVAL;
BEGIN
  -- Only check confirmed bookings
  IF NEW.status = 'confirmed' THEN
    time_until_start := (NEW.start_time - CURRENT_TIMESTAMP);
    time_since_approval := (CURRENT_TIMESTAMP - NEW.updated_at);
    
    -- If approved more than 48 hours before start
    IF time_since_approval > INTERVAL '48 hours' AND 
       time_until_start <= INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- If approved 48 hours or less before start
    ELSIF time_since_approval <= INTERVAL '48 hours' AND 
          time_until_start <= INTERVAL '0 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check cancellation on each update
CREATE TRIGGER check_booking_auto_cancellation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_cancellation();

-- Create function to periodically check bookings
CREATE OR REPLACE FUNCTION process_auto_cancellations()
RETURNS void AS $$
BEGIN
  UPDATE bookings
  SET updated_at = CURRENT_TIMESTAMP
  WHERE status = 'confirmed'
  AND (
    -- Approved >48h before start and within 24h of start
    (updated_at < start_time - INTERVAL '48 hours' AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
    OR
    -- Approved ≤48h before start and past start time
    (updated_at >= start_time - INTERVAL '48 hours' AND CURRENT_TIMESTAMP >= start_time)
  );
END;
$$ LANGUAGE plpgsql;