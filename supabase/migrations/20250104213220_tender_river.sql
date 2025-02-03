/*
  # Fix storage policies for profile pictures

  1. Drop existing policies to ensure clean state
  2. Create new policies with proper authentication checks
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create new policies with proper authentication checks
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profilepics' AND
  (auth.role() = 'authenticated')
);

CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (auth.role() = 'authenticated')
);

CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (auth.role() = 'authenticated')
);