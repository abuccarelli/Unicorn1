-- Add RLS policy for inserting notifications
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- Add policy for system functions to bypass RLS
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for system functions
CREATE POLICY "System functions can manage notifications"
ON notifications
FOR ALL
USING (true)
WITH CHECK (true);