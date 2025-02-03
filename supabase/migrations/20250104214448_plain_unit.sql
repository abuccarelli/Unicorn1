/*
  # Fix storage policies and triggers for profile pictures

  1. Changes
    - Drop existing policies and functions
    - Create new storage policies for profile pictures
    - Add trigger function for profile image updates
    - Create separate triggers for INSERT/UPDATE and DELETE operations

  2. Security
    - Public read access for profile pictures
    - Authenticated users can only manage their own pictures
    - Secure trigger function with SECURITY DEFINER
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own profile pictures" ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_image_upload ON storage.objects;
DROP FUNCTION IF EXISTS handle_profile_image_update();

-- Create simplified storage policies
CREATE POLICY "Public profile pictures access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Authenticated users profile pictures management"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profilepics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add function to handle profile updates
CREATE OR REPLACE FUNCTION handle_storage_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET profile_image = NEW.name
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to handle profile image deletions
CREATE OR REPLACE FUNCTION handle_storage_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET profile_image = NULL 
  WHERE id = (storage.foldername(OLD.name))[1]::uuid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create separate triggers for insert/update and delete
CREATE TRIGGER on_profile_image_change
  AFTER INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_storage_update();

CREATE TRIGGER on_profile_image_delete
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  WHEN (OLD.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_storage_delete();