-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;

-- Create proper policies for conversations
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "Students can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'student'
  )
);

-- Add policy for updating conversations
CREATE POLICY "Users can update their own conversations"
ON conversations FOR UPDATE
USING (auth.uid() = student_id OR auth.uid() = teacher_id)
WITH CHECK (auth.uid() = student_id OR auth.uid() = teacher_id);

-- Add policy for deleting conversations
CREATE POLICY "Users can delete their own conversations"
ON conversations FOR DELETE
USING (auth.uid() = student_id OR auth.uid() = teacher_id);