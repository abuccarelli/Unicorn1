-- Create or replace function to handle notifications for booking status changes
CREATE OR REPLACE FUNCTION handle_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status has changed
  IF NEW.status != OLD.status THEN
    -- Insert notification based on status change
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link
    ) VALUES (
      CASE 
        WHEN NEW.status IN ('confirmed', 'cancelled') THEN NEW.student_id
        ELSE NEW.teacher_id
      END,
      'booking_' || NEW.status,
      'Booking ' || 
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'approved'
        WHEN NEW.status = 'cancelled' THEN 'rejected'
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status = 'paid' THEN 'paid'
        ELSE NEW.status
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Your booking has been approved'
        WHEN NEW.status = 'cancelled' THEN 'Your booking has been rejected'
        WHEN NEW.status = 'completed' THEN 'Your booking has been marked as completed'
        WHEN NEW.status = 'paid' THEN 'Payment received for your booking'
        ELSE 'Your booking status has been updated to ' || NEW.status
      END,
      '/bookings/' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS create_booking_notification ON bookings;
CREATE TRIGGER create_booking_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_notification();

-- Create function to handle notifications for new bookings
CREATE OR REPLACE FUNCTION handle_new_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for teacher
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    link
  ) VALUES (
    NEW.teacher_id,
    'new_booking',
    'New Booking Request',
    'You have received a new booking request',
    '/teacher/requests'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new booking notifications
DROP TRIGGER IF EXISTS create_new_booking_notification ON bookings;
CREATE TRIGGER create_new_booking_notification
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_booking_notification();