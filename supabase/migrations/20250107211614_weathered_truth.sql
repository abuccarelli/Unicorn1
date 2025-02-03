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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System functions can manage notifications" ON notifications;

-- Create policies
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
BEGIN
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
        WHEN NEW.status IN ('confirmed', 'cancelled') THEN NEW.student_id
        ELSE NEW.teacher_id
      END,
      'booking_' || NEW.status,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Booking Approved'
        WHEN NEW.status = 'cancelled' THEN 'Booking Rejected'
        WHEN NEW.status = 'completed' THEN 'Booking Completed'
        WHEN NEW.status = 'paid' THEN 'Payment Received'
        ELSE 'Booking Update'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Your booking has been approved'
        WHEN NEW.status = 'cancelled' THEN 'Your booking has been rejected'
        WHEN NEW.status = 'completed' THEN 'Your booking has been marked as completed'
        WHEN NEW.status = 'paid' THEN 'Payment received for your booking'
        ELSE 'Your booking status has been updated to ' || NEW.status
      END,
      '/student/bookings'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_notification();