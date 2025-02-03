-- Drop existing policies for bookings
DROP POLICY IF EXISTS "Teachers can update booking status" ON bookings;
DROP POLICY IF EXISTS "Teachers can approve bookings" ON bookings;

-- Create new policy for teachers to approve bookings
CREATE POLICY "Teachers can manage bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = teacher_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
)
WITH CHECK (
  auth.uid() = teacher_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
);