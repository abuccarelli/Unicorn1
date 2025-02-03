-- Add 'paid' to status check constraint
ALTER TABLE bookings 
DROP CONSTRAINT bookings_status_check,
ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'paid'));