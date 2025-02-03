-- First update any existing confirmed statuses to approved
UPDATE bookings 
SET status = 'approved' 
WHERE status = 'confirmed';

-- Drop and recreate the status check constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'approved', 'cancelled', 'completed', 'paid'));

-- Update notification function to use approved instead of confirmed
CREATE OR REPLACE FUNCTION handle_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
  teacher_name TEXT;
BEGIN
  -- Get names for the notification
  SELECT concat("firstName", ' ', "lastName") INTO student_name
  FROM profiles WHERE id = NEW.student_id;
  
  SELECT concat("firstName", ' ', "lastName") INTO teacher_name
  FROM profiles WHERE id = NEW.teacher_id;

  -- Only proceed if status has changed
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link
    ) VALUES (
      CASE 
        WHEN NEW.status IN ('approved', 'cancelled') THEN NEW.student_id
        ELSE NEW.teacher_id
      END,
      'booking_' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Booking Approved'
        WHEN NEW.status = 'cancelled' THEN 'Booking Cancelled'
        WHEN NEW.status = 'completed' THEN 'Booking Completed'
        WHEN NEW.status = 'paid' THEN 'Payment Received'
        ELSE 'Booking Update'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN teacher_name || ' approved your booking'
        WHEN NEW.status = 'cancelled' THEN teacher_name || ' cancelled your booking'
        WHEN NEW.status = 'completed' THEN 'Your booking with ' || teacher_name || ' is completed'
        WHEN NEW.status = 'paid' THEN 'Payment received for booking with ' || teacher_name
        ELSE 'Booking status updated to ' || NEW.status
      END,
      CASE 
        WHEN NEW.status IN ('approved', 'cancelled', 'paid') THEN '/student/bookings'
        ELSE '/teacher/requests'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;