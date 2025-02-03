-- Drop the future_booking_check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;