/*
  # Storage setup for profile pictures

  1. Storage Setup
    - Creates profilepics bucket
    - Enables public access
  
  2. Security
    - Allows public read access to profile pictures
    - Allows authenticated users to upload their own profile pictures
    - Allows users to update their own profile pictures
*/

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profilepics', 'profilepics', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profilepics' AND
  auth.uid()::text = (SPLIT_PART(name, '-', 1))::text
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  auth.uid()::text = (SPLIT_PART(name, '-', 1))::text
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profilepics' AND
  auth.uid()::text = (SPLIT_PART(name, '-', 1))::text
);