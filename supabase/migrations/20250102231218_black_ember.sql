/*
  # Add payment fields to profiles table

  1. Changes
    - Add `currency` column to store the teacher's preferred currency
    - Add `hourly_rate` column to store the teacher's hourly rate
    - Add check constraint to ensure currency is one of the allowed values
*/

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