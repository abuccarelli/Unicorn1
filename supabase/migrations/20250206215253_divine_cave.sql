-- Drop existing triggers and functions with CASCADE to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS check_student_requirements_trigger ON profiles;
DROP FUNCTION IF EXISTS check_student_requirements();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create initial profile with minimal required fields
  INSERT INTO public.profiles (
    id,
    email,
    role,
    "firstName",
    "lastName"
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    '',  -- Initialize with empty string
    ''   -- Initialize with empty string
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to check student requirements
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation during initial profile creation
  IF TG_OP = 'INSERT' AND 
     (NEW."firstName" = '' OR NEW."firstName" IS NULL) AND 
     (NEW."lastName" = '' OR NEW."lastName" IS NULL) THEN
    RETURN NEW;
  END IF;

  -- Only validate student profiles that are being updated
  IF NEW.role = 'student' AND TG_OP = 'UPDATE' THEN
    -- Skip validation if nothing important changed
    IF OLD."firstName" = NEW."firstName" AND 
       OLD."lastName" = NEW."lastName" AND 
       OLD.date_of_birth IS NOT DISTINCT FROM NEW.date_of_birth AND
       OLD.guardian_first_name IS NOT DISTINCT FROM NEW.guardian_first_name AND
       OLD.guardian_last_name IS NOT DISTINCT FROM NEW.guardian_last_name AND
       OLD.guardian_email IS NOT DISTINCT FROM NEW.guardian_email AND
       OLD.guardian_phone IS NOT DISTINCT FROM NEW.guardian_phone THEN
      RETURN NEW;
    END IF;

    -- Require basic profile information
    IF NEW."firstName" = '' OR NEW."firstName" IS NULL THEN
      RAISE EXCEPTION 'First name is required';
    END IF;

    IF NEW."lastName" = '' OR NEW."lastName" IS NULL THEN
      RAISE EXCEPTION 'Last name is required';
    END IF;

    -- Handle date_of_birth validation
    IF NEW.date_of_birth IS NOT NULL THEN
      DECLARE
        birth_date DATE;
        age_in_years INTEGER;
      BEGIN
        -- First try DD.MM.YYYY format
        BEGIN
          birth_date := TO_DATE(NEW.date_of_birth::text, 'DD.MM.YYYY');
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
      END;
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

-- Add RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_requirements() TO authenticated;