-- Add last_message column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS last_message TEXT;

-- Update existing conversations with last message
UPDATE conversations c
SET last_message = (
  SELECT content 
  FROM messages m 
  WHERE m.conversation_id = c.id 
  ORDER BY m.created_at DESC 
  LIMIT 1
);