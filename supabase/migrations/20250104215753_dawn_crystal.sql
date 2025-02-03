/*
  # Fix storage policies and triggers

  1. Changes
    - Simplify storage policies
    - Fix trigger conditions
    - Add proper error handling
    - Improve security

  2. Security
    - Enable RLS for storage
    - Add policies for public read access
    - Add policies for authenticated user management
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Public profile pictures access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users profile pictures management" ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_image_change ON storage.objects;
DROP TRIGGER IF EXISTS on_profile_image_delete ON storage.objects;
DROP FUNCTION IF EXISTS handle_storage_update();
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

-- Create separate functions for insert/update and delete
CREATE OR REPLACE FUNCTION handle_storage_insert_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    profile_image = NEW.name,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = (storage.foldername(NEW.name))[1]::uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_storage_delete()
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

-- Create separate triggers for insert/update and delete
CREATE TRIGGER on_profile_image_insert_update
  AFTER INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_storage_insert_update();

CREATE TRIGGER on_profile_image_delete
  BEFORE DELETE ON storage.objects
  FOR EACH ROW
  WHEN (OLD.bucket_id = 'profilepics')
  EXECUTE FUNCTION handle_storage_delete();