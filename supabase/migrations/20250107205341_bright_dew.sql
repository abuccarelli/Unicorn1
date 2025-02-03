-- Check and create tables if they don't exist
DO $$ 
BEGIN
  -- Create conversations table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations') THEN
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(booking_id)
    );

    -- Enable RLS
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

    -- Create conversation policies
    CREATE POLICY "Users can view their own conversations"
      ON conversations
      FOR SELECT
      USING (auth.uid() = student_id OR auth.uid() = teacher_id);
  END IF;

  -- Create messages table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      read_at TIMESTAMPTZ,
      CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
    );

    -- Enable RLS
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

    -- Create message policies
    CREATE POLICY "Users can view messages in their conversations"
      ON messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = messages.conversation_id
          AND (conversations.student_id = auth.uid() OR conversations.teacher_id = auth.uid())
        )
      );

    CREATE POLICY "Users can insert messages in their conversations"
      ON messages
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = conversation_id
          AND (conversations.student_id = auth.uid() OR conversations.teacher_id = auth.uid())
        )
        AND sender_id = auth.uid()
      );
  END IF;

  -- Create notifications table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
    CREATE TABLE notifications (
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

    -- Create notification policies
    CREATE POLICY "Users can view their own notifications"
      ON notifications
      FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY "Users can update their own notifications"
      ON notifications
      FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Create or replace functions and triggers
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_conversation_timestamp ON messages;
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Create or replace notification function
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  conv conversations;
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Get conversation details
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient
  IF NEW.sender_id = conv.student_id THEN
    recipient_id := conv.teacher_id;
  ELSE
    recipient_id := conv.student_id;
  END IF;

  -- Get sender's name
  SELECT concat(profiles."firstName", ' ', profiles."lastName")
  INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    link
  ) VALUES (
    recipient_id,
    'message',
    'New Message',
    concat(sender_name, ' sent you a message'),
    '/messages/' || conv.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS create_message_notification ON messages;
CREATE TRIGGER create_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();