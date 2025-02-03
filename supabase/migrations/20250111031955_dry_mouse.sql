-- First cancel any existing bookings in the past
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE start_time <= CURRENT_TIMESTAMP
  AND status NOT IN ('cancelled', 'completed', 'paid');

-- Then add the constraint with a grace period
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;
ALTER TABLE bookings
  ADD CONSTRAINT future_booking_check
  CHECK (
    status IN ('cancelled', 'completed', 'paid') OR 
    start_time > created_at + INTERVAL '5 minutes'
  );