-- First update any existing bookings that would violate the constraint
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE start_time <= created_at
  AND status NOT IN ('cancelled', 'completed', 'paid');

-- Then add the constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;
ALTER TABLE bookings
  ADD CONSTRAINT future_booking_check
  CHECK (
    status IN ('cancelled', 'completed', 'paid') OR 
    start_time > created_at
  );