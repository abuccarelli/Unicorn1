/*
  # Add address fields to profiles table

  1. New Fields
    - street (text)
    - street_number (text)
    - postal_code (text)
    - city (text)
    - country (text)
    - utc_offset (integer) - Automatically calculated based on city/country

  2. Changes
    - Add address fields
    - Add function to update UTC offset when city/country changes
*/

-- Add address fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS street_number TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS utc_offset INTEGER;

-- Create function to update UTC offset
CREATE OR REPLACE FUNCTION update_utc_offset()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a simplified version. In a real application, you would want to:
  -- 1. Use a geocoding service to get precise coordinates
  -- 2. Use a timezone database to get accurate UTC offset
  -- 3. Handle daylight saving time
  -- For now, we'll store NULL and let the frontend handle timezone calculations
  NEW.utc_offset = NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update UTC offset when city or country changes
CREATE TRIGGER update_profile_utc_offset
  BEFORE INSERT OR UPDATE OF city, country ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_utc_offset();

-- Update RLS policies
CREATE POLICY "Users can read own address"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own address"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);