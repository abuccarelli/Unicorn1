-- First, update any existing bookings in the past to cancelled status
UPDATE bookings 
SET 
  status = 'cancelled',
  updated_at = CURRENT_TIMESTAMP
WHERE start_time <= CURRENT_TIMESTAMP
  AND status NOT IN ('cancelled', 'completed', 'paid');

-- Add constraint for future bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_check;
ALTER TABLE bookings
  ADD CONSTRAINT future_booking_check
  CHECK (status IN ('cancelled', 'completed', 'paid') OR start_time > created_at);

-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS check_booking_status ON bookings;
DROP FUNCTION IF EXISTS check_booking_status();
DROP FUNCTION IF EXISTS cancel_overdue_bookings();

-- Create updated function to handle booking cancellations
CREATE OR REPLACE FUNCTION check_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle pending bookings
  IF NEW.status = 'pending' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  
  -- Handle confirmed bookings
  ELSIF NEW.status = 'confirmed' THEN
    -- Cancel if start time has passed
    IF CURRENT_TIMESTAMP >= NEW.start_time THEN
      NEW.status := 'cancelled';
      NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status checks
CREATE TRIGGER check_booking_status
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_status();

-- Create function to immediately check and cancel bookings
CREATE OR REPLACE FUNCTION cancel_overdue_bookings()
RETURNS void AS $$
BEGIN
  -- Cancel pending and confirmed bookings if start time has passed
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status IN ('pending', 'confirmed')
    AND CURRENT_TIMESTAMP >= start_time;
END;
$$ LANGUAGE plpgsql;

-- Run immediate check
SELECT cancel_overdue_bookings();