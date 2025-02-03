-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add typing_at column to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS typing_at TIMESTAMPTZ;

-- Add read_at column to messages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable RLS on new table
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for message attachments
CREATE POLICY "Users can view attachments in their conversations"
ON message_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_attachments.message_id
    AND (c.student_id = auth.uid() OR c.teacher_id = auth.uid())
  )
);

CREATE POLICY "Users can upload attachments to their messages"
ON message_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_id
    AND (c.student_id = auth.uid() OR c.teacher_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_conversations_typing ON conversations(typing_at) WHERE typing_at IS NOT NULL;