/*
  # Fix Profile Picture Management

  1. Changes
    - Ensure one picture per user
    - Auto-delete old pictures
    - Simplified storage policies
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Public profile pictures access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users profile pictures management" ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_picture_upload ON storage.objects;
DROP FUNCTION IF EXISTS handle_profile_picture_change();

-- Create simplified storage policies
CREATE POLICY "Public profile pictures access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Authenticated users profile pictures management"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'profilepics')
WITH CHECK (bucket_id = 'profilepics');

-- Function to handle profile picture changes
CREATE OR REPLACE FUNCTION handle_profile_picture_change()
RETURNS TRIGGER AS $$
DECLARE
  old_picture TEXT;
BEGIN
  -- Get current profile picture
  SELECT profile_image INTO old_picture
  FROM profiles
  WHERE id = auth.uid();

  -- Delete old picture if it exists
  IF old_picture IS NOT NULL THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'profilepics' AND name = old_picture;
  END IF;

  -- Update profile with new picture
  UPDATE profiles 
  SET profile_image = NEW.name
  WHERE id = auth.uid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile picture changes
CREATE TRIGGER on_profile_picture_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_profile_picture_change();