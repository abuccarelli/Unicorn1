-- Add policy for students to update their own bookings
CREATE POLICY "Students can update their own bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'student'
  )
)
WITH CHECK (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'student'
  )
);