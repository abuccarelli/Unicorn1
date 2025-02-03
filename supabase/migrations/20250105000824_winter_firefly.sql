-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profilepics',
  'profilepics',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png'];

-- Create simplified policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Authenticated users can manage own folder"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profilepics' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profilepics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);