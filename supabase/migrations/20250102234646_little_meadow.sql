/*
  # Add profile picture column to profiles table

  1. Changes
    - Add profile_image column to profiles table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN profile_image TEXT;
  END IF;
END $$;