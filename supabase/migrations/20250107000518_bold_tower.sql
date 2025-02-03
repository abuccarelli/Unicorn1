/*
  # Fix booking auto-cancellation

  1. Changes
    - Improve cancellation logic
    - Add immediate check function
    - Fix time comparison issues
*/

-- Improve the cancellation check function
CREATE OR REPLACE FUNCTION check_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  approval_time TIMESTAMPTZ;
BEGIN
  -- For confirmed bookings only
  IF NEW.status = 'confirmed' THEN
    -- Get the time when booking was approved (last update time)
    approval_time := OLD.updated_at;
    
    -- Case 1: Approved >48h before start
    IF (NEW.start_time - approval_time) > INTERVAL '48 hours' AND
       (NEW.start_time - CURRENT_TIMESTAMP) <= INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
      
    -- Case 2: Approved ≤48h before start
    ELSIF (NEW.start_time - approval_time) <= INTERVAL '48 hours' AND
          CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to immediately check and cancel bookings
CREATE OR REPLACE FUNCTION cancel_overdue_bookings()
RETURNS void AS $$
BEGIN
  -- Update confirmed bookings that meet cancellation criteria
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'confirmed'
    AND (
      -- Case 1: Approved >48h before start and within 24h of start
      (start_time - updated_at > INTERVAL '48 hours' 
       AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
      OR
      -- Case 2: Approved ≤48h before start and past start time
      (start_time - updated_at <= INTERVAL '48 hours' 
       AND CURRENT_TIMESTAMP >= start_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();