/*
  # Profile Picture Management Fix

  1. Changes
    - Ensure proper cleanup of old pictures
    - Fix storage policies
    - Add proper error handling
    - Improve file organization
*/

-- Drop existing policies and triggers for a clean slate
DROP POLICY IF EXISTS "Public profile pictures access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users profile pictures management" ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_picture_upload ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_picture_delete ON storage.objects;
DROP FUNCTION IF EXISTS handle_profile_picture_change();
DROP FUNCTION IF EXISTS handle_profile_picture_delete();

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

-- Function to handle profile picture changes with proper cleanup
CREATE OR REPLACE FUNCTION handle_profile_picture_change()
RETURNS TRIGGER AS $$
DECLARE
  old_picture_path TEXT;
BEGIN
  -- Get current profile picture path
  SELECT profile_image INTO old_picture_path
  FROM profiles
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;

  -- If there's an existing picture and it's different from the new one
  IF old_picture_path IS NOT NULL AND old_picture_path != NEW.name THEN
    BEGIN
      -- Delete old file from storage
      DELETE FROM storage.objects
      WHERE bucket_id = 'profilepics' AND name = old_picture_path;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with update
      RAISE NOTICE 'Failed to delete old profile picture: %', SQLERRM;
    END;
  END IF;

  -- Update profile with new picture
  UPDATE profiles 
  SET 
    profile_image = NEW.name,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile picture changes
CREATE TRIGGER on_profile_picture_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_profile_picture_change();