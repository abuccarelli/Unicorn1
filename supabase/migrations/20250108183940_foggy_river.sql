-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_pending_booking_cancellation();

-- Create function to check and cancel pending bookings
CREATE OR REPLACE FUNCTION check_pending_booking_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check pending bookings
  IF NEW.status = 'pending' THEN
    -- Case 1: Submitted >48h ago and within 24h of start
    IF (CURRENT_TIMESTAMP - NEW.created_at) > INTERVAL '48 hours' AND
       (NEW.start_time - CURRENT_TIMESTAMP) <= INTERVAL '24 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Case 2: Submitted ≤48h ago and within 2h of start
    ELSIF (CURRENT_TIMESTAMP - NEW.created_at) <= INTERVAL '48 hours' AND
          (NEW.start_time - CURRENT_TIMESTAMP) <= INTERVAL '2 hours' THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pending booking cancellations
CREATE TRIGGER check_pending_booking_auto_cancellation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_pending_booking_cancellation();

-- Immediately check and cancel any pending bookings that should be cancelled
UPDATE bookings
SET updated_at = CURRENT_TIMESTAMP
WHERE status = 'pending'
AND (
  -- Case 1: Submitted >48h ago and within 24h of start
  (CURRENT_TIMESTAMP - created_at > INTERVAL '48 hours' 
   AND start_time - CURRENT_TIMESTAMP <= INTERVAL '24 hours')
  OR
  -- Case 2: Submitted ≤48h ago and within 2h of start
  (CURRENT_TIMESTAMP - created_at <= INTERVAL '48 hours' 
   AND start_time - CURRENT_TIMESTAMP <= INTERVAL '2 hours')
);