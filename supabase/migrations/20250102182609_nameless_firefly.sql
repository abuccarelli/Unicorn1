/*
  # Update profile column names to camelCase

  1. Changes
    - Rename `first_name` to `firstName`
    - Rename `last_name` to `lastName`

  2. Security
    - Preserves existing RLS policies
    - No data loss during migration
*/

-- Rename columns to match TypeScript types
ALTER TABLE profiles 
  RENAME COLUMN first_name TO "firstName";

ALTER TABLE profiles 
  RENAME COLUMN last_name TO "lastName";

-- Update the trigger function to use new column names
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    "firstName",
    "lastName"
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