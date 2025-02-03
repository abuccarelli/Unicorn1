-- Drop existing policies
DROP POLICY IF EXISTS "Public profile pictures access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users profile pictures management" ON storage.objects;

-- Create proper storage policies
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Users can insert their own profile pictures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profilepics', 'profilepics', true)
ON CONFLICT (id) DO UPDATE SET public = true;