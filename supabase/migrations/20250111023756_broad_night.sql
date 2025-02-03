-- First, update any existing bookings in the past to cancelled status
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE start_time <= CURRENT_TIMESTAMP
  AND status NOT IN ('cancelled', 'completed', 'paid');

-- Now we can safely add the constraint for future bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;
ALTER TABLE bookings
  ADD CONSTRAINT future_booking_check
  CHECK (status IN ('cancelled', 'completed', 'paid') OR start_time > created_at);

-- Update check_booking_status function
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Case 1: Cancel if created more than 48 hours ago AND still pending 24 hours prior to lesson's start
    IF (CURRENT_TIMESTAMP - NEW.created_at > INTERVAL '48 hours') AND
       (NEW.start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours') THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Case 2: Cancel if created less than or equal to 48 hours ago AND start time has passed
    ELSIF (CURRENT_TIMESTAMP - NEW.created_at <= INTERVAL '48 hours') AND
          CURRENT_TIMESTAMP >= NEW.start_time THEN
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