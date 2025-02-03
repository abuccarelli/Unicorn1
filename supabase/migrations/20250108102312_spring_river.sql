-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_booking_auto_cancellation ON bookings;
DROP FUNCTION IF EXISTS check_booking_cancellation();

-- Create improved cancellation check function
CREATE OR REPLACE FUNCTION check_booking_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check confirmed (approved) bookings
  IF NEW.status = 'confirmed' THEN
    -- Early approval case (>48h before start)
    IF (NEW.start_time - NEW.updated_at) > INTERVAL '48 hours' AND
       (NEW.start_time - CURRENT_TIMESTAMP) <= INTERVAL '24 hours' AND
       NEW.status != 'paid' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Late approval case (≤48h before start)
    ELSIF (NEW.start_time - NEW.updated_at) <= INTERVAL '48 hours' AND
          CURRENT_TIMESTAMP >= NEW.start_time AND
          NEW.status != 'paid' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER check_booking_auto_cancellation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_cancellation();

-- Immediately check and cancel any unpaid bookings that should be cancelled
UPDATE bookings
SET updated_at = CURRENT_TIMESTAMP
WHERE status = 'confirmed'
AND (
  -- Early approval case
  (start_time - updated_at > INTERVAL '48 hours' 
   AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours'
   AND status != 'paid')
  OR
  -- Late approval case
  (start_time - updated_at <= INTERVAL '48 hours' 
   AND CURRENT_TIMESTAMP >= start_time
   AND status != 'paid')
);