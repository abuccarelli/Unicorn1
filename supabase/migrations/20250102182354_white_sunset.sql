/*
  # Update profile name fields

  1. Changes
    - Split 'name' field into 'firstName' and 'lastName'
    - Update trigger function to handle new name fields
    - Migrate existing data

  2. Security
    - Maintains existing RLS policies
    - No changes to security model needed
*/

-- Add new columns
ALTER TABLE profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Migrate existing data
DO $$ 
BEGIN 
  -- Split existing name into first_name and last_name
  UPDATE profiles 
  SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1);

  -- Handle cases where there's no space in name
  UPDATE profiles 
  SET last_name = ''
  WHERE last_name IS NULL;
END $$;

-- Make the new columns required
ALTER TABLE profiles 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Update the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    first_name,
    last_name
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'firstName', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'lastName', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old name column
ALTER TABLE profiles DROP COLUMN name;