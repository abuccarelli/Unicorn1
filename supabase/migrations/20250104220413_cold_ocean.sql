/*
  # Simplified Profile Picture Management

  1. Changes
    - Simplified storage policies
    - Basic profile picture management
*/

-- Drop existing policies and triggers for a clean slate
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

-- Simple function to update profile image
CREATE OR REPLACE FUNCTION handle_profile_picture_change()
RETURNS TRIGGER AS $$
BEGIN
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