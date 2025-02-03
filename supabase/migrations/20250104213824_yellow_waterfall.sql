/*
  # Fix storage policies for profile pictures

  1. Update storage policies to use user ID folders
  2. Simplify policy checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage profile pictures" ON storage.objects;

-- Create new policies with folder-based structure
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Users can manage their own profile pictures"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);