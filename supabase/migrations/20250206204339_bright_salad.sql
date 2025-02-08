-- Add date of birth and guardian information columns
ALTER TABLE profiles
ADD COLUMN date_of_birth DATE,
ADD COLUMN guardian_first_name TEXT,
ADD COLUMN guardian_last_name TEXT,
ADD COLUMN guardian_email TEXT,
ADD COLUMN guardian_phone TEXT;

-- Create function to check age and guardian info requirements
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check student profiles
  IF NEW.role = 'student' THEN
    -- Require date of birth
    IF NEW.date_of_birth IS NULL THEN
      RAISE EXCEPTION 'Date of birth is required for students';
    END IF;

    -- Calculate age
    IF (NEW.date_of_birth + INTERVAL '18 years') > CURRENT_DATE THEN
      -- Under 18 - require guardian information
      IF NEW.guardian_first_name IS NULL OR 
         NEW.guardian_last_name IS NULL OR 
         NEW.guardian_email IS NULL OR 
         NEW.guardian_phone IS NULL THEN
        RAISE EXCEPTION 'Guardian information is required for students under 18';
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