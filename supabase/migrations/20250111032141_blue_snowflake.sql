-- First remove the problematic constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;

-- Add a new constraint that allows a small buffer for request processing
ALTER TABLE bookings
  ADD CONSTRAINT future_booking_check
  CHECK (
    status IN ('cancelled', 'completed', 'paid') OR 
    (start_time > created_at AND start_time > CURRENT_TIMESTAMP - INTERVAL '1 minute')
  );

-- Update any existing bookings that violate the constraint
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE start_time <= CURRENT_TIMESTAMP
  AND status NOT IN ('cancelled', 'completed', 'paid');