/*
  # Add profile storage and currency fields

  1. Changes
    - Add currency column with currency code validation
    - Add hourly_rate column for teacher pricing
    - Add storage-related security policies
*/

-- Add currency and hourly_rate columns if they don't exist
DO $$ 
BEGIN
  -- Add currency column with check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'currency'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN currency TEXT CHECK (currency IN ('JPY', 'EUR', 'CHF', 'DKK', 'SEK', 'NOK', 'USD', 'GBP'));
  END IF;

  -- Add hourly_rate column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN hourly_rate DECIMAL(10,2);
  END IF;
END $$;

-- Create security policies for profile updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own profile currency'
  ) THEN
    CREATE POLICY "Users can update their own profile currency"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;