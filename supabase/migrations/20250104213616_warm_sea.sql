/*
  # Fix profile picture storage and display

  1. Ensure proper storage policies
  2. Add trigger to update profile_image URL
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create simplified storage policies
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profilepics');

CREATE POLICY "Authenticated users can manage profile pictures"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'profilepics')
WITH CHECK (bucket_id = 'profilepics');

-- Create or replace function to handle profile image updates
CREATE OR REPLACE FUNCTION handle_profile_image_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile_image column with the new URL
  UPDATE profiles 
  SET profile_image = NEW.name
  WHERE id = (SPLIT_PART(NEW.name, '-', 1))::uuid;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profile image updates
DROP TRIGGER IF EXISTS on_profile_image_upload ON storage.objects;
CREATE TRIGGER on_profile_image_upload
  AFTER INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_profile_image_update();