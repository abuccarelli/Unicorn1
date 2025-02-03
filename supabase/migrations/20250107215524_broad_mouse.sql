-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System functions can manage notifications" ON notifications;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System functions can manage notifications"
  ON notifications
  USING (true)
  WITH CHECK (true);

-- Create function to handle booking notifications
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
  IF TG_OP = 'INSERT' THEN
    -- New booking notification for teacher
    INSERT INTO notifications (user_id, type, title, content, link)
    VALUES (
      NEW.teacher_id,
      'new_booking',
      'New Booking Request',
      'New booking request from ' || student_name,
      '/teacher/requests'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status change notifications
    INSERT INTO notifications (user_id, type, title, content, link)
    VALUES (
      CASE 
        WHEN NEW.status IN ('confirmed', 'cancelled') THEN NEW.student_id
        ELSE NEW.teacher_id
      END,
      'booking_' || NEW.status,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Booking Approved'
        WHEN NEW.status = 'cancelled' THEN 'Booking Cancelled'
        WHEN NEW.status = 'completed' THEN 'Booking Completed'
        WHEN NEW.status = 'paid' THEN 'Payment Received'
        ELSE 'Booking Update'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN teacher_name || ' approved your booking'
        WHEN NEW.status = 'cancelled' THEN teacher_name || ' cancelled your booking'
        WHEN NEW.status = 'completed' THEN 'Your booking with ' || teacher_name || ' is completed'
        WHEN NEW.status = 'paid' THEN 'Payment received for booking with ' || teacher_name
        ELSE 'Booking status updated to ' || NEW.status
      END,
      '/student/bookings'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_notification();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);