-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO UPDATE 
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

-- Create storage policies
CREATE POLICY "Users can read message attachments from their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE (storage.foldername(name))[1] = c.id::text
    AND (c.student_id = auth.uid() OR c.teacher_id = auth.uid())
  )
);

CREATE POLICY "Users can upload message attachments to their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id::text = (storage.foldername(name))[1]
    AND (student_id = auth.uid() OR teacher_id = auth.uid())
  )
);

-- Add function to generate public URL
CREATE OR REPLACE FUNCTION get_attachment_public_url(file_path TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'https://' || current_setting('custom.storage_public_url', true) || 
         '/storage/v1/object/public/message-attachments/' || file_path;
$$;

-- Add public_url column that uses the function
ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS public_url TEXT GENERATED ALWAYS AS (
  get_attachment_public_url(file_path)
) STORED;