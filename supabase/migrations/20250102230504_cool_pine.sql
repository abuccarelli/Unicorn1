/*
  # Add languages column to profiles table

  1. Changes
    - Add `languages` array column to profiles table to store user's known languages
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'languages'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN languages TEXT[] DEFAULT '{}';
  END IF;
END $$;