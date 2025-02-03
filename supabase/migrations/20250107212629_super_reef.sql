-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Students can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

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

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- Create proper message policies
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.student_id = auth.uid() OR conversations.teacher_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_id
    AND (
      -- Students can always send messages
      (conversations.student_id = auth.uid()) OR
      -- Teachers can only reply to existing conversations
      (conversations.teacher_id = auth.uid() AND
       EXISTS (
         SELECT 1 FROM messages
         WHERE messages.conversation_id = conversation_id
       ))
    )
  )
  AND sender_id = auth.uid()
);