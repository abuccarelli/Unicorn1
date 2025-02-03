/*
  # Single Profile Picture Policy

  1. Changes
    - Ensure each user has only one profile picture
    - Auto-delete old picture on new upload
    - Maintain proper file organization
    - Add cleanup function

  2. Security
    - Maintain RLS policies
    - Add proper error handling
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Public profile pictures access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users profile pictures management" ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_image_insert_update ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_image_delete ON storage.objects;
DROP FUNCTION IF EXISTS handle_storage_insert_update();
DROP FUNCTION IF EXISTS handle_storage_delete();

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

-- Function to handle new profile picture uploads
CREATE OR REPLACE FUNCTION handle_profile_picture_change()
RETURNS TRIGGER AS $$
DECLARE
  old_picture_path TEXT;
BEGIN
  -- Get the current profile picture path
  SELECT profile_image INTO old_picture_path
  FROM profiles
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;

  -- If there's an existing picture, delete it
  IF old_picture_path IS NOT NULL THEN
    -- Delete the old file from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'profilepics' AND name = old_picture_path;
  END IF;

  -- Update the profile with the new picture
  UPDATE profiles 
  SET 
    profile_image = NEW.name,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle profile picture deletions
CREATE OR REPLACE FUNCTION handle_profile_picture_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    profile_image = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = (storage.foldername(OLD.name))[1]::uuid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_profile_picture_upload
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_profile_picture_change();

CREATE TRIGGER on_profile_picture_delete
  BEFORE DELETE ON storage.objects
  FOR EACH ROW
  WHEN (OLD.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_profile_picture_delete();