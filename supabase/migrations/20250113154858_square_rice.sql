-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- First ensure all existing statuses are valid
UPDATE bookings 
SET status = 'approved' 
WHERE status = 'confirmed';

-- Drop and recreate the status check constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'approved', 'cancelled', 'completed', 'paid'));