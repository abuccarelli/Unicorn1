-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_student_requirements_trigger ON profiles;
DROP FUNCTION IF EXISTS check_student_requirements();

-- Create improved function to check student requirements
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
DECLARE
  age_in_years INTEGER;
BEGIN
  -- Only check student profiles
  IF NEW.role = 'student' THEN
    -- Parse date of birth if it's a string in DD.MM.YYYY format
    IF NEW.date_of_birth IS NOT NULL THEN
      BEGIN
        -- Try to parse the date
        NEW.date_of_birth := TO_DATE(NEW.date_of_birth, 'DD.MM.YYYY');
      EXCEPTION WHEN OTHERS THEN
        -- If parsing fails, assume it's already a valid date
        NULL;
      END;
      
      -- Calculate age
      age_in_years := EXTRACT(YEAR FROM age(CURRENT_DATE, NEW.date_of_birth::DATE));
      
      -- Under 18 - require guardian information
      IF age_in_years < 18 THEN
        IF NEW.guardian_first_name IS NULL OR 
           NEW.guardian_last_name IS NULL OR 
           NEW.guardian_email IS NULL OR 
           NEW.guardian_phone IS NULL THEN
          RAISE EXCEPTION 'Guardian information is required for students under 18';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for student requirements
CREATE TRIGGER check_student_requirements_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_student_requirements();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Update existing profiles to ensure data consistency
UPDATE profiles
SET date_of_birth = NULL
WHERE date_of_birth = '1970-01-01'::DATE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_student_requirements() TO authenticated;