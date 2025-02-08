-- Drop existing trigger and function with CASCADE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

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
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', '')
  );

  -- Don't enforce guardian info requirements during initial signup
  -- This will be handled when they complete their profile
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Modify the student requirements check to be less strict during signup
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
DECLARE
  birth_date DATE;
  age_in_years INTEGER;
BEGIN
  -- Only check student profiles
  IF NEW.role = 'student' THEN
    -- Skip validation if this is initial profile creation
    IF TG_OP = 'INSERT' AND 
       NEW."firstName" = '' AND 
       NEW."lastName" = '' AND
       NEW.date_of_birth IS NULL THEN
      RETURN NEW;
    END IF;

    -- Handle date_of_birth in DD.MM.YYYY format
    IF NEW.date_of_birth IS NOT NULL THEN
      BEGIN
        -- First try DD.MM.YYYY format
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
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for student requirements
DROP TRIGGER IF EXISTS check_student_requirements_trigger ON profiles;
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