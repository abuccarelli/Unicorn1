-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_student_requirements_trigger ON profiles;
DROP FUNCTION IF EXISTS check_student_requirements();

-- Create improved function to check student requirements
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
DECLARE
  birth_date DATE;
  age_in_years INTEGER;
BEGIN
  -- Only check student profiles
  IF NEW.role = 'student' THEN
    -- Handle date_of_birth in DD.MM.YYYY format
    IF NEW.date_of_birth IS NOT NULL THEN
      BEGIN
        -- First try DD.MM.YYYY format
        birth_date := TO_DATE(NEW.date_of_birth, 'DD.MM.YYYY');
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          -- Then try ISO format
          birth_date := NEW.date_of_birth::DATE;
        EXCEPTION WHEN OTHERS THEN
          RAISE EXCEPTION 'Invalid date format. Please use DD.MM.YYYY';
        END;
      END;

      -- Store the date in a consistent format
      NEW.date_of_birth := birth_date;
      
      -- Calculate age
      age_in_years := EXTRACT(YEAR FROM age(CURRENT_DATE, birth_date));
      
      -- Under 18 - require guardian information
      IF age_in_years < 18 THEN
        -- Check each guardian field individually for better error messages
        IF NEW.guardian_first_name IS NULL OR NEW.guardian_first_name = '' THEN
          RAISE EXCEPTION 'Guardian first name is required for students under 18';
        END IF;
        
        IF NEW.guardian_last_name IS NULL OR NEW.guardian_last_name = '' THEN
          RAISE EXCEPTION 'Guardian last name is required for students under 18';
        END IF;
        
        IF NEW.guardian_email IS NULL OR NEW.guardian_email = '' THEN
          RAISE EXCEPTION 'Guardian email is required for students under 18';
        END IF;
        
        IF NEW.guardian_phone IS NULL OR NEW.guardian_phone = '' THEN
          RAISE EXCEPTION 'Guardian phone number is required for students under 18';
        END IF;

        -- Validate email format
        IF NEW.guardian_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
          RAISE EXCEPTION 'Invalid guardian email format';
        END IF;

        -- Validate phone format (basic validation)
        IF NEW.guardian_phone !~ '^\+?[0-9\s\-()]{8,}$' THEN
          RAISE EXCEPTION 'Invalid guardian phone format';
        END IF;
      END IF;
    ELSE
      RAISE EXCEPTION 'Date of birth is required for students';
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

-- Add NOT NULL constraint for date_of_birth for students
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS student_date_of_birth_check;

ALTER TABLE profiles
ADD CONSTRAINT student_date_of_birth_check 
CHECK (role != 'student' OR date_of_birth IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_dob 
ON profiles(role, date_of_birth)
WHERE role = 'student';

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_student_requirements() TO authenticated;